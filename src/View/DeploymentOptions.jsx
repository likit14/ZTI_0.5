import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Layout from '../Components/layout';
import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, notification } from 'antd';
import '../Styles/DeploymentOptions.css';

const DeploymentOptions = () => {
  const location = useLocation();
  const [size, setSize] = useState('large');
  const [selectedOption, setSelectedOption] = useState(null);
  const [redirectTo, setRedirectTo] = useState(false);
  const [notificationShown, setNotificationShown] = useState(false); // New state for notification tracking

  useEffect(() => {
    const loginNotification = localStorage.getItem('loginNotification');

    if (loginNotification) {
      notification.success({
        message: 'Notification',
        description: 'Login Successful! Welcome back!',
        placement: 'topRight',
      });
      localStorage.removeItem('loginNotification'); // Clear the notification flag
    }
  }, []);

  const handleOptionClick = (option) => {
    setSelectedOption(option === selectedOption ? null : option);
  };

  const handleNextClick = () => {
    if (selectedOption === "Standalone Cloud Setup") {
      setRedirectTo('/networkscanner');
    } else if (selectedOption === "Distributed Cloud Setup") {
      setRedirectTo('/error');
    }
  };

  if (redirectTo) {
    return <Navigate to={redirectTo} />;
  }

  return (
    <Layout>
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Deployment</Breadcrumb.Item>
      </Breadcrumb>
      <div>
        <h2>Deployment Model</h2>
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
              <Button className="custom-button" type="primary" onClick={handleNextClick}>Start</Button>
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
    </Layout>
  );
};

export default DeploymentOptions;
