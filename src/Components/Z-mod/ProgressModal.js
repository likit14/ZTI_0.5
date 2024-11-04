import React, { useState, useEffect } from 'react';
import { Modal, Progress, Button } from 'antd';

const ProgressModal = ({ visible, onClose, onNext }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (visible) {
      setProgress(0); 
      setIsComplete(false);

      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 100) return prev + 1; 
          clearInterval(interval);
          setIsComplete(true);
          return prev;
        });
      }, 10800);

      return () => {
        clearInterval(interval);
      };
    }
  }, [visible]);

  return (
    <Modal title="Installation in Progress" visible={visible} footer={null} closable={false}>
      <p>Please wait while the PinakaOS is being initialized...</p>
      <Progress percent={progress} />
      {isComplete && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Button type="primary" onClick={onNext}> {/* Trigger onNext when clicking Next */}
            Next
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default ProgressModal;

