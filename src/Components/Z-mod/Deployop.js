import React, { useState } from 'react';
import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Modal, Input } from 'antd';
import axios from 'axios';  // Import axios for making HTTP requests
import '../../Styles/DeploymentOptions.css';


const DeploymentOptions = ({ onStart }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cloudName, setCloudName] = useState('');
  const hostIP = process.env.REACT_APP_HOST_IP || "localhost";  //retrive host ip

  const handleOptionClick = (option) => {
    setSelectedOption(option === selectedOption ? null : option);

    // Show modal if "Standalone Cloud Setup" is selected
    if (option === "Standalone Cloud Setup") {
      setIsModalVisible(true);
    }
  };

  const updateMetadata = (name) => {
    // Check if a meta tag for the cloud name exists
    let cloudNameMeta = document.querySelector('meta[name="cloud-name"]');

    if (!cloudNameMeta) {
      // Create the meta tag if it doesn't exist
      cloudNameMeta = document.createElement('meta');
      cloudNameMeta.name = 'cloud-name'; // Custom name for cloud
      document.head.appendChild(cloudNameMeta);
    }

    cloudNameMeta.content = name; // Store the cloud name in the content
  };

  const handleModalOk = async () => {
    try {
      // Check if the cloud name already exists in the database
      const response = await axios.post(`http://${hostIP}:5000/check-cloud-name`, {
        cloudName,
      });

      if (response.status === 200) {
        // Cloud name is available, proceed with the setup
        updateMetadata(cloudName);
        onStart(cloudName);

        // Close the modal
        setIsModalVisible(false);
        setCloudName(""); // Clear the input
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        Modal.error({
          title: "Cloud Name Unavailable",
          content: error.response.data.message,
        });
      } else {
        console.error("Error checking cloud name:", error);
        Modal.error({
          title: "Error",
          content: "An error occurred while checking the cloud name. Please try again later.",
        });
      }
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false); // Close the modal
    setCloudName(''); // Clear the input
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

      <Modal
        title="Cloud Name"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okButtonProps={{ disabled: !cloudName, style: { width: '80px' } }} // Combine styles for okButtonProps
        cancelButtonProps={{ style: { width: '80px', marginRight: '8px' } }} // Combine styles for cancelButtonProps
        style={{ maxWidth: '400px' }} // Optional: limits the modal width
      >
        <Input
          placeholder="Enter your Cloud Name"
          value={cloudName}
          onChange={(e) => setCloudName(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default DeploymentOptions;
