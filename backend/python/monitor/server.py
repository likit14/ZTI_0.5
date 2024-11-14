from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import os
import logging
import time
from subprocess import Popen, PIPE
import sys
import signal
import atexit

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes and all origins
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Starting Flask app...")

# Expected files for deployment progress
expected_files = [
    'script1_done', 'script2_done', 'script3_done', 'script4_done',
    'script5_done', 'script6_done', 'script7_done', 'script8_done'
]

def tail_file(file_path):
    """Helper function to tail the content of a file."""
    with open(file_path, 'r') as file:
        logger.info(f"Tailing file: {file_path}")
        while True:
            line = file.readline()
            if not line:
                time.sleep(0.1)  # Wait for more content to appear
                continue
            logger.info(f"New log line: {line.strip()}")  # Log each new line
            yield f"data: {line.strip()}\n\n"

def get_deployment_progress(targetserver_ip):
    """Function to calculate the deployment progress based on the files present for a given IP."""
    markers_directory = f'/home/pinaka/markers/{targetserver_ip}'  # Dynamically set directory path based on IP
    
    if not os.path.exists(markers_directory):
        logger.warning(f"Markers directory for IP {targetserver_ip} does not exist.")
        return 0, []  # Return 0% progress if the directory doesn't exist

    try:
        files_in_directory = set(os.listdir(markers_directory))
    except Exception as e:
        logger.error(f"Error accessing markers directory: {e}")
        return 0, []  # If there's an error accessing the directory, return 0% progress
    
    present_files = [file for file in expected_files if file in files_in_directory]
    progress = (len(present_files) / len(expected_files)) * 100
    return progress, present_files

def tail_files_in_order(targetserver_ip):
    """Tail files in the order specified in expected_files."""
    markers_directory = f'/home/pinaka/markers/{targetserver_ip}'

    # Check for each file in the expected order and tail its contents
    for file in expected_files:
        file_path = os.path.join(markers_directory, file)

        # If the file exists, start tailing it
        if os.path.exists(file_path):
            logger.info(f"Tailing file: {file_path}")
            yield from tail_file(file_path)  # Stream the content of the file to frontend
        else:
            logger.info(f"File {file_path} not found, skipping...")

    # Keep the connection alive by sending dummy data if no file content is present
    while True:
        time.sleep(5)  # Sleep to simulate waiting
        yield "data: Waiting for new logs...\n\n"


@app.route('/get-progress', methods=['GET'])
def get_progress():
    """Get the current deployment progress based on present files."""
    targetserver_ip = request.args.get('targetserver_ip')  # Get IP from query parameters
    if not targetserver_ip:
        return jsonify({'error': 'IP is required'}), 400  # Return error if IP is not provided

    # Get the deployment progress for the provided IP
    progress, present_files = get_deployment_progress(targetserver_ip)
    
    # Return the progress and present files in JSON response
    return jsonify({'progress': progress, 'present_files': present_files})

@app.route('/tail-logs')
def tail_logs():
    """Stream log data for deployment progress."""
    targetserver_ip = request.args.get('targetserver_ip')  # Get IP from query parameters
    if not targetserver_ip:
        return jsonify({'error': 'IP is required'}), 400  # Return error if IP is not provided

    # Use Server-Sent Events (SSE) to stream the logs
    return Response(tail_files_in_order(targetserver_ip), content_type='text/event-stream')

# Route for streaming logs (SSE)
def tail_log():
    syslog_path = '/var/log/dnsmasq.log'  # The log file you want to tail
    logger.info(f"Starting to tail {syslog_path}")
    
    # Tail the dnsmasq.log file
    process = Popen(f'sudo stdbuf -oL tail -f {syslog_path}', stdout=PIPE, stderr=PIPE, shell=True)
    success_sent = False

    # Read output from the tail process
    while True:
        line = process.stdout.readline().decode('utf-8')
        
        if line:
            # Yield all logs to the frontend (stream full logs)
            yield f"data: {line.strip()}\n\n"

            # If the log line contains "pinaka", send a success message and stop
            if "pinaka" in line:
                logger.info("Pinaka OS boot message detected.")
                yield "data: Successfully booted Pinaka OS\n\n"  # Send success message via SSE
                success_sent = True
                break  # Stop after the success message is sent
        else:
            break  # Exit loop if no more output

    # Terminate the process if success is detected
    if success_sent:
        logger.info("Terminating the tail process after success.")
        process.terminate()

    # In case there's no success and the loop ends, terminate the process anyway
    if not success_sent:
        logger.warning("No success message detected. Terminating process.")
        process.terminate()

@app.route('/events')
def sse():
    """This route streams events from the backend."""
    return Response(tail_log(), content_type='text/event-stream')

@app.route('/')
def index():
    return 'Backend server running'

def cleanup():
    """Cleanup function for graceful shutdown of processes."""
    logger.info("Shutting down Flask server and cleaning up.")
    # Add any additional cleanup logic here if necessary

# Register cleanup function to run on shutdown
atexit.register(cleanup)

# Handling termination signals (Ctrl+C, kill signals)
signal.signal(signal.SIGINT, lambda signum, frame: cleanup())
signal.signal(signal.SIGTERM, lambda signum, frame: cleanup())

if __name__ == '__main__':
    # Start the Flask app
    app.run(host='0.0.0.0', port=5055, debug=True)
