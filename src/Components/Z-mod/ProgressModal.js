import React, { useState, useEffect } from 'react';
import { Modal, Progress } from 'antd';

const ProgressModal = ({ visible, onClose }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (visible) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 100) return prev + 1; // Increase by 1% every 15 seconds
          clearInterval(interval);
          return prev;
        });
      }, 15000); // Update every 15 seconds

      // Simulate receiving the file after 25 minutes
      const timeout = setTimeout(() => {
        clearInterval(interval);
        onClose(); // Close the modal when the file is received
      }, 1500000); // 25 minutes in milliseconds

      return () => {
        clearInterval(interval); // Cleanup on unmount
        clearTimeout(timeout); // Cleanup timeout
      };
    }
  }, [visible, onClose]);

  return (
    <Modal title="Installation in Progress" visible={visible} footer={null} closable={false}>
      <p>Please wait while the  PinakaOS is being intialized...</p>
      <Progress percent={progress} />
    </Modal>
  );
};

export default ProgressModal;
