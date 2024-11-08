import React, { useState } from 'react';
import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, Button } from 'antd';
import '../../Styles/DeploymentOptions.css';

const DeploymentOptions = ({ onStart }) => {  // Accepting onStart prop
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionClick = (option) => {
    setSelectedOption(option === selectedOption ? null : option);

    // Trigger onStart immediately if "Standalone Cloud Setup" is selected
    if (option === "Standalone Cloud Setup") {
      onStart();
    }
  };

  return (
    <div style={{ padding: '20px' }}> {/* Add padding to keep spacing */}
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Deployment</Breadcrumb.Item>
      </Breadcrumb>
      <div>
        <h4>Deployment Model</h4>
        <div
          className={`option-box ${selectedOption === "Standalone Cloud Setup" ? 'selected' : ''}`}
          onClick={() => handleOptionClick("Standalone Cloud Setup")}
        >
          <h5>Single-Node</h5>
          <div className="option">
            <div className="option-content front" style={{ borderRadius: '8px', padding: '15px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
              <div className="option-text" style={{ fontSize: '1em', color: '#333', lineHeight: '1.6' }}>
                <strong>All-in-One Setup:</strong> A streamlined, self-contained cloud environment where all OpenStack services are deployed on a single server, perfect for development and testing.
              </div>
              <Button className="custom-button" type="primary">Start</Button>
            </div>
          </div>
        </div>
        <div
          className={`option-box ${selectedOption === "Distributed Cloud Setup" ? 'selected' : ''}`}
          onClick={() => handleOptionClick("Distributed Cloud Setup")}
        >
          <h5>Multi-Node</h5>
          <div className="option">
            <div className="option-content front" style={{ borderRadius: '8px', padding: '15px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
              <div className="option-text" style={{ fontSize: '1em', color: '#333', lineHeight: '1.6' }}>
                <strong>Multi-Node Setup:</strong> A multi-node setup uses multiple machines for cloud services, including management, compute, and networking. This setup improves scalability and reliability for workloads.
              </div>
              <Button className="custom-button" type="primary" disabled>Start</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentOptions;
