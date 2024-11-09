import React, { useState, useEffect, useRef } from 'react';
import { Modal, Progress, Button } from 'antd';
import Swal from 'sweetalert2';

const ProgressModal = ({ visible, onNext }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(visible);
  const [logs, setLogs] = useState([]); // To store real-time logs
  const [isLogsExpanded, setIsLogsExpanded] = useState(false); // To control log panel expansion
  const logContainerRef = useRef(null); // Ref to the logs container

  useEffect(() => {
    if (visible) {
      // Reset everything when the modal is visible
      setIsModalVisible(true);
      setProgress(0);
      setIsComplete(false);
      setLogs([]); // Clear logs when modal opens

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
        newEventSource.close();  // Make sure to close the EventSource on unmount
      };
    }
  }, [visible, onNext]);  // Re-run whenever 'visible' or 'onNext' changes

  // Scroll to the bottom of the log container whenever logs change
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]); // Trigger on every logs update

  // Toggle the logs panel expansion
  const toggleLogs = () => {
    setIsLogsExpanded(!isLogsExpanded);
  };

  return (
    <>
      {/* Add styles here */}
      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }

          .log-item {
            opacity: 0;
            animation: fadeIn 0.5s forwards;
          }
        `}
      </style>

      <Modal
        title="Installation in Progress"
        visible={isModalVisible}
        footer={null}
        closable={false}
      >
        <p>Please wait while the PinakaOS is being initialized...</p>
        <Progress percent={progress} />

        {/* View Logs Button */}
        <button
          onClick={toggleLogs}
          style={{
            display: 'block',
            margin: '10px auto',
            background: 'none',
            marginLeft: '170px',
            border: 'none',
            color: '#1890ff',
            cursor: 'pointer',
            textDecoration: 'none'
          }}
        >
          View Logs
        </button>

        {/* Logs Panel */}
        {isLogsExpanded && (
          <div
            ref={logContainerRef}
            style={{
              backgroundColor: '#212529',  // Black background
              color: 'white',              // White text
              padding: '10px',             // Padding for a cleaner look
              height: '150px',             // Fixed height for the log box
              width: '100%',               // Full width of the parent container
              borderRadius: '5px',         // Rounded corners for a cleaner look
              overflowY: 'hidden',           // Enable vertical scrolling when content exceeds height
              overflowX: 'hidden',         // Prevent horizontal scrolling
              scrollBehavior: 'smooth'     // Smooth scroll transition when new logs come in
            }}
          >
            {/* Display logs dynamically */}
            {logs.length === 0 ? (
              <p style={{ color: 'gray' }}>No logs available.</p>
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

        {isComplete && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Button type="primary" onClick={onNext}>
              Next
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ProgressModal;
