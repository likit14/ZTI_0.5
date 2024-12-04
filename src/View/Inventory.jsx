import React, { useState, useEffect } from "react";
import Layout1 from "../Components/layout";
import { theme, Layout, Card, Button, Modal, Spin, Empty } from "antd";

const { Content } = Layout;

const Inventory = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [serverData, setServerData] = useState(null);
  const [serverInfoAllInOne, setServerInfoAllInOne] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null);


useEffect(() => {
    const userID = localStorage.getItem('id'); // Retrieve userID from local storage
  
    if (!userID) {
      console.error("User ID not found in local storage");
      setLoading(false);
      return;
    }
  
    setLoading(true);
  
    fetch(`http://192.168.249.100:5000/api/allinone?userID=${userID}`)
      .then((response) => {
        console.log('Full response:', response);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Received data from API:', data);
        setServerInfoAllInOne(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching All-in-One data:', error);
        setLoading(false);
      });
  }, []);

  const showConfirmationModal = (action) => {
    setActionType(action);
    setIsModalVisible(true);
  };

  const handleConfirmAction = () => {
    setIsModalVisible(false);
    if (actionType) {
      console.log(`${actionType} action confirmed.`);
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
        title={`Server ${index + 1}`}
        style={{
          marginTop: 20,
          borderRadius: borderRadiusLG,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-start", gap: "8px" }}>
          <Button
            color="danger"
            size="small"
            style={{ width: "80px" }}
            onClick={() => showConfirmationModal("Power Off")}
          >
            Power Off
          </Button>
          <Button
            type="primary"
            size="small"
            style={{ width: "80px" }}
            onClick={() => showConfirmationModal("Power On")}
          >
            Power On
          </Button>
          <Button
            type="default"
            size="small"
            style={{ width: "80px" }}
            onClick={() => showConfirmationModal("Power Reset")}
          >
            Power Reset
          </Button>
          <Button
            type="dashed"
            size="small"
            style={{ width: "80px" }}
            onClick={() => showConfirmationModal("Check Status")}
          >
            Check Status
          </Button>
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

        {/* Modal for Confirmation */}
        <Modal
          title={`Confirm ${actionType}`}
          visible={isModalVisible}
          onOk={handleConfirmAction}
          onCancel={handleCancelAction}
          okText="Confirm"
          cancelText="Cancel"
          footer={
            <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
              <Button
                key="cancel"
                onClick={handleCancelAction}
                style={{ width: "80px", marginRight: "8px" }}
              >
                Cancel
              </Button>
              <Button
                key="confirm"
                type="primary"
                onClick={handleConfirmAction}
                style={{ width: "80px" }}
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
