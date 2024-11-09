import React, { useState, useEffect } from 'react';
import { Modal, Progress, Button } from 'antd';
import Swal from 'sweetalert2';

const ProgressModal = ({ visible, onNext }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(visible);
  const [eventSource, setEventSource] = useState(null);

  useEffect(() => {
    if (visible) {
      // Reset everything when the modal is visible
      setIsModalVisible(true);
      setProgress(0);
      setIsComplete(false);

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
        }
      };

      // Handle errors
      newEventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        newEventSource.close();  // Close on error to avoid leaking connections
      };

      // Store the EventSource so we can close it later
      setEventSource(newEventSource);

      // Cleanup on component unmount
      return () => {
        clearInterval(interval);
        newEventSource.close();  // Make sure to close the EventSource on unmount
      };
    }
  }, [visible, onNext]);  // Re-run whenever 'visible' or 'onNext' changes

  return (
    <Modal
      title="Installation in Progress"
      visible={isModalVisible}
      footer={null}
      closable={false}
    >
      <p>Please wait while the PinakaOS is being initialized...</p>
      <Progress percent={progress} />
      {isComplete && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Button type="primary" onClick={onNext}>
            Next
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default ProgressModal;
