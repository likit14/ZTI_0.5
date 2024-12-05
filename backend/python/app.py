from flask import Flask, jsonify, request
from flask_cors import CORS
from scapy.all import ARP, Ether, srp
import ipaddress
import netifaces
import concurrent.futures
import logging
from datetime import datetime
import subprocess
import requests  # Add this import

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Setup logging
logging.basicConfig(level=logging.INFO)

@app.route('/')
def home():
    return "Flask app is running"

# Function to get the local network IP
def get_local_network_ip():
    interfaces = netifaces.interfaces()
    for interface in interfaces:
        addresses = netifaces.ifaddresses(interface)
        if netifaces.AF_INET in addresses:  # Check if the interface has an IPv4 address
            for link in addresses[netifaces.AF_INET]:
                if 'addr' in link and not link['addr'].startswith('127.'):
                    return link['addr']
    return None  # Return None if no suitable IP address is found

# Function to get the network range (CIDR)
def get_network_range(local_ip):
    ip_interface = ipaddress.IPv4Interface(local_ip + '/24')  # Assuming /24 subnet
    network = ip_interface.network
    return network

# Function to scan the network (ARP scan)
def scan_network(network):
    arp_request = ARP(pdst=str(network))
    broadcast = Ether(dst="ff:ff:ff:ff:ff:ff")
    arp_request_broadcast = broadcast / arp_request
    answered_list = srp(arp_request_broadcast, timeout=5, retry=3, verbose=False)[0]  # Increased timeout and retries

    active_nodes = []
    for sent, received in answered_list:
        node_info = {
            'ip': received.psrc,
            'mac': received.hwsrc,
            'last_seen': datetime.now().strftime('%Y-%m-%d')
        }
        active_nodes.append(node_info)

    return active_nodes

# Function to send subnet to Express.js backend
def send_subnet_to_express(subnet, ip):
    express_url = f"http://{ip}:9909/pxe-config"  # Replace with actual IP
    headers = {'Content-Type': 'application/json'}
    payload = {'subnet': str(subnet)}  # Send subnet in the body
    
    response = requests.post(express_url, json=payload, headers=headers)

    if response.status_code == 200:
        return response.json()  # Return the response from the Express backend
    else:
        return {"error": "Failed to send subnet to Express backend", "status_code": response.status_code}

@app.route('/scan', methods=['GET'])
def scan_network_api():
    logging.info("Received scan request")

    # Check if a subnet is provided in the query parameters
    subnet = request.args.get('subnet')
    local_ip = get_local_network_ip()  # Ensure the local IP is retrieved before using it
    
    if not local_ip:
        logging.error("Failed to retrieve local network IP address.")
        return jsonify({"error": "Failed to retrieve local network IP address."}), 500

    if subnet:
        try:
            # Validate and parse the subnet
            network = ipaddress.IPv4Network(subnet, strict=False)
            logging.info(f"Scanning provided subnet: {network}")
        except ValueError:
            logging.error("Invalid subnet format provided.")
            return jsonify({"error": "Invalid subnet format."}), 400
    else:
        # Use the local network IP if no subnet is provided
        network = get_network_range(local_ip)
        logging.info(f"Scanning local network: {network}")

    # Send subnet to Express.js backend (optional step)
    express_response = send_subnet_to_express(network, local_ip)

    # Perform the network scan
    active_nodes = scan_network(network)
    logging.info(f"Active nodes found: {active_nodes}")

    # Return both active nodes and the response from Express.js backend
    return jsonify(active_nodes)

@app.route('/set_pxe_boot', methods=['POST'])
def set_pxe_boot():
    data = request.json
    bmc_ip = data.get('ip')
    username = data.get('username')
    password = data.get('password')

    if not all([bmc_ip, username, password]):
        return jsonify({'status': 'error', 'message': 'Missing BMC details'}), 400

    try:
        # Change boot order to PXE
        subprocess.run([
            'ipmitool', '-I', 'lanplus', '-H', bmc_ip, '-U', username, '-P', password,
            'chassis', 'bootdev', 'pxe'
        ], check=True)

        # Restart the system
        subprocess.run([
            'ipmitool', '-I', 'lanplus', '-H', bmc_ip, '-U', username, '-P', password,
            'chassis', 'power', 'reset'
        ], check=True)

        return jsonify({'status': 'success', 'message': 'Boot order changed to PXE and system restarted'}), 200
    except subprocess.CalledProcessError as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

EXPRESS_API_URL = "http://192.168.249.100:5000/api/get-power-details"
@app.route("/power-status", methods=["POST"])
def power_status():
    try:
        # Get the data from the request
        data = request.json
        print(f"Received request data: {data}")  # Log the received data for debugging

        if not data:
            return jsonify({"error": "No data received"}), 400

        user_id = data.get("userID")
        action = data.get("action")  # This will be either None or a valid action like 'on', 'off', etc.

        if not user_id:
            return jsonify({"error": "Missing userID"}), 400

        # Fetch server details once from Express API
        response = requests.post(EXPRESS_API_URL, json={"userID": user_id})
        if response.status_code != 200:
            print(f"Error fetching server details from Express API: {response.status_code}")
            return jsonify({"error": "Failed to fetch server details from Express API"}), 500

        server_details = response.json()
        print(f"Fetched server details: {server_details}")  # Log the server details

        cloud_name = server_details.get("cloudName")
        ip = server_details.get("ip")
        username = server_details.get("username")
        password = server_details.get("password")

        if not ip or not username or not password or not cloud_name:
            return jsonify({"error": "Invalid server details from Express API"}), 400

        # If no action is provided, just return the server details
        if not action:
            return jsonify({
                "cloudName": cloud_name,
                "bmc_ip": ip,
                "message": "Server details fetched successfully"
            })

        # Mapping the action to the appropriate IPMI command
        command_map = {
            "on": f"ipmitool -I lanplus -H {ip} -U {username} -P {password} chassis power on",
            "off": f"ipmitool -I lanplus -H {ip} -U {username} -P {password} chassis power off",
            "reset": f"ipmitool -I lanplus -H {ip} -U {username} -P {password} chassis power reset",
            "status": f"ipmitool -I lanplus -H {ip} -U {username} -P {password} chassis power status",
        }

        # If the action is not valid, return an error
        command = command_map.get(action)
        if not command:
            return jsonify({"error": "Invalid action. Valid actions are: 'on', 'off', 'reset', 'status'"}), 400

        # Running the IPMI command using subprocess
        result = subprocess.run(command, shell=True, text=True, capture_output=True)
        print(f"Command: {command}")
        print(f"Return code: {result.returncode}")
        print(f"Standard Output: {result.stdout}")
        print(f"Standard Error: {result.stderr}")

        if result.returncode != 0:
            print(f"Error executing command: {result.stderr}")
            return jsonify({"error": "Failed to execute command", "details": result.stderr}), 500

        return jsonify({
            "message": result.stdout.strip(),
            "timestamp": datetime.now().isoformat(),  # Use datetime now()
            "cloudName": cloud_name,
            "bmc_ip": ip
        })

    except Exception as e:
        # Print the error for debugging
        print(f"Error occurred: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, threaded=True)
