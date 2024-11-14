import React, { useState, useEffect } from 'react';
import { Modal, Progress, Button, Alert } from 'antd';
import Swal from 'sweetalert2';
import Marquee from 'react-fast-marquee';

const ProgressModal = ({ visible, onNext }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(visible);
  const [logs, setLogs] = useState([]);
  const [isLogsExpanded, setIsLogsExpanded] = useState(false);

  const [showMarquee, setShowMarquee] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsModalVisible(true);
      setProgress(0);
      setIsComplete(false);
      setLogs([]); // Clear logs when modal opens

      // Show marquee for 5 minutes after the modal is visible
      setShowMarquee(true);
      const marqueeTimeout = setTimeout(() => {
        setShowMarquee(false);
      }, 30000);  // 5 minutes timeout

      // Start the progress bar
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 100) return prev + 1;
          clearInterval(interval);
          setIsComplete(true);
          return prev;
        });
      }, 10800); // Adjust progress interval time as needed

      // Create a new EventSource connection to the backend
      const newEventSource = new EventSource('http://192.168.249.100:5055/events');

      // Handle server messages
      newEventSource.onmessage = (event) => {
        if (event.data === 'Successfully booted Pinaka OS') {
          setIsComplete(true);
          setIsModalVisible(false);  // Close modal after success

          // Use a small delay before showing SweetAlert to ensure modal closes
          setTimeout(() => {
            Swal.fire({
              title: 'Success!',
              text: 'Pinaka OS has been successfully booted!',
              icon: 'success',
              confirmButtonText: 'OK',
            }).then(() => {
              onNext();  // Trigger the parent's SweetAlert
            });
          }, 500);

          // Close the EventSource connection once success message is received
          newEventSource.close();
        } else {
          // Add new log message to logs array
          setLogs((prevLogs) => [...prevLogs, event.data]);
        }
      };

      // Handle errors
      newEventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        newEventSource.close();  // Close on error to avoid leaking connections
      };

      // Store the EventSource so we can close it later
      return () => {
        clearInterval(interval);
        clearTimeout(marqueeTimeout);  // Clear the timeout when component unmounts
        newEventSource.close();  // Make sure to close the EventSource on unmount
      };
    }
  }, [visible, onNext]);  // Re-run whenever 'visible' or 'onNext' changes

  // Scroll to the bottom of the log container whenever logs change
  useEffect(() => {
    const logContainer = document.getElementById('logContainer');
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }, [logs]); // Trigger on every logs update

  // Toggle the logs panel expansion
  const toggleLogs = () => {
    setIsLogsExpanded(!isLogsExpanded);
  };

  return (
    <>
      {/* Conditionally render the marquee message at the top */}
      {progress < 100 && showMarquee && (
        <Alert
          banner
          type="warning" // This will make the alert yellow
          message={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Marquee pauseOnHover gradient={false}>
                Please refrain from closing this tab or navigating away from the page during this process.
              </Marquee>
            </div>
          }
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999,
            width: '55%',
            maxWidth: '600px',
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          }}
        />
      )}

      <Modal
        title="Installation in Progress"
        visible={isModalVisible}
        footer={null}
        closable={false}  // Disable the close button
        maskClosable={false}  // Prevent closing when clicking outside the modal
        onCancel={() => setIsModalVisible(false)}  // Optionally, you can still have this for programmatic control
      >
        <p>Please wait while the PinakaOS is being initialized...</p>

        {/* Progress bar */}
        <Progress percent={progress} />

        {/* View Logs Button */}
        <button
          onClick={toggleLogs}
          style={{
            display: 'block',
            margin: '10px auto',
            background: 'none',
            border: 'none',
            color: '#1890ff',
            cursor: 'pointer',
            textDecoration: 'none',
            padding: '10px 20px', // Add padding for button height and width
            textAlign: 'center', // Ensure the text is centered
            fontSize: '16px', // Set a readable font size
            borderRadius: '4px', // Add rounded corners
            outline: 'none', // Remove outline to improve button aesthetics
          }}
        >
          View Logs
        </button>


        {/* Logs Panel */}
        {isLogsExpanded && (
          <div
            id="logContainer"
            style={{
              backgroundColor: '#212529',
              color: 'white',
              padding: '10px',
              height: '150px',
              width: '100%',
              borderRadius: '5px',
              overflowY: 'hidden',
              overflowX: 'hidden',
              scrollBehavior: 'smooth'
            }}
          >
            {/* Display logs dynamically */}
            {logs.length === 0 ? (
              <p style={{ color: 'gray' }}>Wait for logs to be generated...</p>
            ) : (
              <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                {logs.map((log, index) => (
                  <li key={index} className="log-item" style={{ marginBottom: 8 }}>
                    <span style={{ color: '#6c757d' }}>→</span> {log}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Always show Next button, but disable until progress is 100% */}
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          {/* <Button 
            type="primary" 
            onClick={onNext}
            disabled={progress < 100}  // Disable until progress is complete
          >
            Next
          </Button> */}
        </div>
      </Modal>
    </>
  );
};

export default ProgressModal;
