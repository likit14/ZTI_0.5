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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5055, debug=True)
