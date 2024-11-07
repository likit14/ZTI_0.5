import React, { useState, useEffect } from 'react';
import { Modal, Progress, Button } from 'antd';
import Swal from 'sweetalert2';

const ProgressModal = ({ visible, onClose, onNext }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (visible) {
      setProgress(0);
      setIsComplete(false);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 100) return prev + 1;
          clearInterval(interval);
          setIsComplete(true);
          return prev;
        });
      }, 10800);

      // Establish SSE connection
      const eventSource = new EventSource('http://192.168.249.100:5055/events');
      
      eventSource.onmessage = (event) => {
        if (event.data === 'Successfully booted Pinaka OS') {
          setIsComplete(true);
          Swal.fire({
            title: 'Success!',
            text: 'Pinaka OS has been successfully booted!',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            onNext();
          });
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
      };

      // Cleanup on component unmount
      return () => {
        clearInterval(interval);
        eventSource.close();
      };
    }
  }, [visible, onNext]);

  return (
    <Modal title="Installation in Progress" visible={visible} footer={null} closable={false}>
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

