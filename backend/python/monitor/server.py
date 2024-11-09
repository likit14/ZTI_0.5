from flask import Flask, Response
from flask_cors import CORS
from subprocess import Popen, PIPE
import logging

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes and all origins
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Starting Flask app...")

def tail_log():
    """Tails the dnsmasq log and sends events through SSE"""
    logger.info("Starting to tail /var/log/dnsmasq.log")
    process = Popen('stdbuf -oL tail -f /var/log/dnsmasq.log', stdout=PIPE, stderr=PIPE, shell=True)
    success_sent = False
    
    while True:
        line = process.stdout.readline().decode('utf-8')
        if line:
            if "DHCPACK" in line:
                logger.info(f"Found DHCPACK: {line.strip()}")
                yield f"data: {line.strip()}\n\n"  # Send the DHCPACK line via SSE

                if "pinaka" in line:
                    logger.info("Pinaka OS boot message detected.")
                    yield "data: Successfully booted Pinaka OS\n\n"  # Send the success message via SSE
                    success_sent = True
                    break  # Stop after the success message is sent
        else:
            break
    
    # Terminate the background process if success is detected
    if success_sent:
        process.terminate()


@app.route('/events')
def sse():
    """This route is triggered on each Deploy button click."""
    return Response(tail_log(), content_type='text/event-stream')


@app.route('/')
def index():
    return 'Backend server running'


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5055, debug=True)
