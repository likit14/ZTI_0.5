from flask import Flask, Response, jsonify
from flask_cors import CORS
import os
import logging
from threading import Thread

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes and all origins
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Starting Flask app...")

# Path to the markers directory and expected files
markers_directory = '/home/pinaka/markers'
expected_files = [
    'script1_done', 'script2_done', 'script3_done', 'script4_done',
    'script5_done', 'script6_done', 'script7_done', 'script8_done'
]

def get_deployment_progress():
    files_in_directory = set(os.listdir(markers_directory))
    present_files = [file for file in expected_files if file in files_in_directory]
    progress = (len(present_files) / len(expected_files)) * 100
    return progress, present_files

@app.route('/get-progress', methods=['GET'])
def get_progress():
    """Get the current deployment progress based on present files."""
    progress, present_files = get_deployment_progress()
    return jsonify({'progress': progress, 'present_files': present_files})

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

if __name__ == '__main__':
    # Start the Flask app
    app.run(host='0.0.0.0', port=5055, debug=True)
