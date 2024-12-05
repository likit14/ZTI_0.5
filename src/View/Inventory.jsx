import React, { useState, useEffect } from "react";
import Layout1 from "../Components/layout";
import { theme, Layout, Card, Button, Modal, Spin, Empty, message, Tag } from "antd";

const { Content } = Layout;

const Inventory = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [serverData, setServerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [powerStatus, setPowerStatus] = useState(null);  // Initially null, no power status set
  const [lastChecked, setLastChecked] = useState(null);   // Track last checked time

  // Fetch server data on component mount
  useEffect(() => {
    const loginDetails = JSON.parse(localStorage.getItem('loginDetails'));
    const userID = loginDetails ? loginDetails.data.id : null;

    if (!userID) {
      console.error("User ID not found in local storage");
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('Fetching data with userID:', userID);
    fetch("http://192.168.249.100:8000/power-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID }),  // Only send userID on initial load, no action
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.cloudName && data.bmc_ip) {
          // Ensure data is an array
          setServerData([data]);  // Wrap the single server object in an array
        } else {
          setServerData([]);  // Set an empty array if no server data
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching server data:", error);
        setServerData([]);
        setLoading(false);
      });
  }, []);

  // Retrieve power status and last checked time from sessionStorage
  useEffect(() => {
    const storedPowerStatus = sessionStorage.getItem("powerStatus");
    const storedLastChecked = sessionStorage.getItem("lastChecked");

    if (storedPowerStatus) {
      setPowerStatus(storedPowerStatus);
    }

    if (storedLastChecked) {
      setLastChecked(storedLastChecked);
    }
  }, []);

  const sendPowerRequest = async (action) => {
    const loginDetails = JSON.parse(localStorage.getItem('loginDetails'));
    const userID = loginDetails ? loginDetails.data.id : null;

    if (!userID) {
      message.error("User ID not found");
      return;
    }
    if (!["on", "off", "reset", "status"].includes(action)) {
      message.error("Invalid action");
      return;
    }

    setLoading(true);

    fetch("http://192.168.249.100:8000/power-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID, action }), 
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          message.success(`${data.message}`);
          if (action === 'status') {
            const currentDate = new Date();
            const formattedTime = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
            const newPowerStatus = data.message.includes('on') ? 'on' : 'off';
            
            // Store power status and last checked time in sessionStorage
            sessionStorage.setItem("powerStatus", newPowerStatus);
            sessionStorage.setItem("lastChecked", formattedTime);

            setPowerStatus(newPowerStatus); 
            setLastChecked(formattedTime); 
          }
        } else {
          message.error(`Failed to ${action} the server: ${data.error || "Unknown error"}`);
        }
      })
      .catch((error) => {
        console.error("Error sending power request:", error);
        message.error("An error occurred while sending the request.");
      })
      .finally(() => setLoading(false));
  };

  const showConfirmationModal = (action, server) => {
    setActionType(action);
    setSelectedServer(server);
    setIsModalVisible(true);
  };

  const handleConfirmAction = () => {
    setIsModalVisible(false);
    if (actionType && selectedServer) {
      sendPowerRequest(actionType); // Only pass the actionType
    }
  };

  const handleCancelAction = () => {
    setIsModalVisible(false);
  };

  const renderServerDetails = () => {
    if (loading) {
      return <Spin tip="Loading server information..." />;
    }

    if (!serverData || serverData.length === 0) {
      return <Empty description="No servers available." />;
    }

    return serverData.map((server, index) => (
      <Card
        key={index}
        title={`${server.cloudName} Cloud - ${server.bmc_ip}`}
        style={{
          marginTop: 20,
          borderRadius: borderRadiusLG,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
          {/* Left Section for Buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <Button
              danger
              size="small"
              style={{ width: "80px" }}
              onClick={() => showConfirmationModal("on", server)}  // Pass actionType "on"
            >
              Power On
            </Button>
            <Button
              type="primary"
              size="small"
              style={{ width: "80px" }}
              onClick={() => showConfirmationModal("off", server)}  // Pass actionType "off"
            >
              Power Off
            </Button>
            <Button
              type="default"
              size="small"
              style={{ width: "80px" }}
              onClick={() => showConfirmationModal("reset", server)}  // Pass actionType "reset"
            >
              Reset
            </Button>
            <Button
              type="dashed"
              size="small"
              style={{ width: "80px" }}
              onClick={() => showConfirmationModal("status", server)}  // Pass actionType "status"
            >
              Status
            </Button>
          </div>

          {/* Only show power status after "Status" button is clicked */}
          {powerStatus !== null && (
            <div style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
              {powerStatus === 'on' ? (
                <Tag color="green" style={{ marginLeft: '10px' }}><span style={{ marginRight: '5px' }}>•</span> Power On</Tag>
              ) : (
                <Tag color="red" style={{ marginLeft: '10px' }}><span style={{ marginRight: '5px' }}>•</span> Power Off</Tag>
              )}
              {lastChecked && <span style={{ marginLeft: '10px', fontStyle: 'italic' }}>Last checked: {lastChecked}</span>}
            </div>
          )}
        </div>
      </Card>
    ));
  };

  return (
    <Layout1>
      <Layout>
        <Content style={{ margin: "16px 16px" }}>
          <div
            style={{
              padding: 30,
              minHeight: "auto",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <h2>Inventory</h2>
          </div>
          <div
            style={{
              marginTop: 10,
              padding: 30,
              minHeight: "auto",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {renderServerDetails()}
          </div>
        </Content>

        <Modal
          title={`Confirm ${actionType}`}
          visible={isModalVisible}
          onOk={handleConfirmAction}
          onCancel={handleCancelAction}
          okText="Confirm"
          cancelText="Cancel"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <Button
                key="cancel"
                onClick={handleCancelAction}
                style={{
                  width: '80px',
                  marginRight: '8px', // Adds space between the buttons
                }}
              >
                Cancel
              </Button>
              <Button
                key="confirm"
                type="primary"
                onClick={handleConfirmAction}
                style={{
                  width: '80px',
                }}
              >
                Confirm
              </Button>
            </div>
          }
        >
          <p>Are you sure you want to {actionType} the server?</p>
        </Modal>
      </Layout>
    </Layout1>
  );
};

export default Inventory;
