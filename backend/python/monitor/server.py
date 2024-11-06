from flask import Flask, Response
from flask_cors import CORS
from subprocess import Popen, PIPE
import threading
import logging
import time

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes and all origins
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Starting Flask app...")

def tail_log():
    logger.info("Starting to tail /var/log/syslog")
    process = Popen('stdbuf -oL tail -f /var/log/syslog', stdout=PIPE, stderr=PIPE, shell=True)
    
    while True:
        line = process.stdout.readline().decode('utf-8')
        if line:
            # Only log and yield lines that contain "DHCPACK"
            if "DHCPACK" in line:
                logger.info(f"Found DHCPACK: {line.strip()}")
                yield f"data: {line.strip()}\n\n"  # Send the DHCPACK line via SSE
                
                # Check if the line also contains "pinaka"
                if "pinaka" in line:
                    logger.info("Pinaka OS boot message detected.")
                    yield "data: Successfully booted Pinaka OS\n\n"  # Send the success message via SSE
                    break  # Stop after the message is sent
        else:
            break

@app.route('/events')
def sse():
    return Response(tail_log(), content_type='text/event-stream')

@app.route('/')
def index():
    return 'Backend server running'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5055, debug=True)

