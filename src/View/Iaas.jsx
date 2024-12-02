import React, { useState, useEffect } from 'react';
import Layout1 from '../Components/layout';
import { theme, Layout, Card, Collapse, Empty, Spin, Button, Modal } from 'antd';
import { Tabs } from 'antd';

const { Content } = Layout;
const { Panel } = Collapse;

const Iaas = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [activeTab, setActiveTab] = useState("1");
  const [disabledTabs] = useState({ "1": true });
  const [serverInfoAllInOne, setServerInfoAllInOne] = useState(null);
  const [serverInfoMultinode, setServerInfoMultinode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null);

  // Simulate fetching data from a database
  useEffect(() => {
    setLoading(true);

    // Mock API call
    setTimeout(() => {
      // Simulate fetched data
      const fetchedAllInOne = {
        cloudName: "All-in-One Cloud",
        ip: "192.168.1.1",
        skylineUrl: "http://skyline.example.com",
        cephUrl: "http://ceph.example.com",
        mysqlTimestamp: "2024-11-29 10:00:00",
        bmcIp: "192.168.1.2",
        bmcUsername: "admin",
        bmcPassword: "password123",
      };

      const fetchedMultinode = null; // Simulate no data for Multinode

      setServerInfoAllInOne(fetchedAllInOne);
      setServerInfoMultinode(fetchedMultinode);
      setLoading(false);
    }, 2000); // Simulating a 2-second API response time
  }, []);

  // Show confirmation modal for server actions (Power On, Power Off, Power Reset)
  const showConfirmationModal = (action) => {
    setActionType(action);
    setIsModalVisible(true);
  };

  // Handle the confirmation action
  const handleConfirmAction = () => {
    setIsModalVisible(false);
    if (actionType) {
      console.log(`${actionType} action confirmed for All-in-One Server`);
      // Add your logic for Power Off, Power On, or Power Reset here
    }
  };

  // Handle cancel action for modal
  const handleCancelAction = () => {
    setIsModalVisible(false);
  };

  // Function to render server details
  const renderServerDetails = (serverInfo) => {
    if (loading) {
      return <Spin tip="Loading server information..." />;
    }

    if (!serverInfo) {
      return <Empty description="No server information available." />;
    }

    const { cloudName, ip, skylineUrl, cephUrl, mysqlTimestamp, bmcIp, bmcUsername, bmcPassword } = serverInfo;

    return (
      <Card
        title={`${cloudName} (${ip})`}
        style={{
          marginTop: 20,
          borderRadius: borderRadiusLG,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
        extra={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              color="danger" variant="solid"
              size="small"
              style={{ marginRight: 8 }}
              onClick={() => showConfirmationModal('Power Off')}
            >
              Power Off
            </Button>
            <Button
              type="primary"
              size="small"
              style={{ marginRight: 8 }}
              onClick={() => showConfirmationModal('Power On')}
            >
              Power On
            </Button>
            <Button
              type="default"
              size="small"
              onClick={() => showConfirmationModal('Power Reset')}
            >
              Power Reset
            </Button>
          </div>
        }
      >
        <Collapse bordered={false} ghost>
          <Panel header="Server Details" key="1">
            <p><strong>Skyline URL:</strong> <a href={skylineUrl}>{skylineUrl}</a></p>
            <p><strong>Ceph URL:</strong> <a href={cephUrl}>{cephUrl}</a></p>
            <p><strong>MySQL Timestamp:</strong> {mysqlTimestamp}</p>
            <p><strong>BMC IP:</strong> {bmcIp}</p>
            <p><strong>BMC Username:</strong> {bmcUsername}</p>
            <p><strong>BMC Password:</strong> {bmcPassword}</p>
          </Panel>
        </Collapse>
      </Card>
    );
  };

  return (
    <Layout1>
      <Layout>
        <Content style={{ margin: "16px 16px" }}>
          <div style={{
            padding: 30,
            minHeight: "auto",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}>
            <h3 style={{ marginTop: '20px' }}>Infrastructure as a Service (IaaS)</h3>
          </div>
          <div style={{
            marginTop: 10,
            padding: 30,
            minHeight: "auto",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}>
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key)}
              tabBarStyle={{
                display: "flex",
                justifyContent: "space-between",
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
                padding: "10px",
              }}
              centered
            >
              {/* All-in-One Tab */}
              <Tabs.TabPane
                tab={
                  <div
                    style={{
                      padding: "10px 30px",
                      color:'#000',
                      borderRadius: borderRadiusLG,
                      textAlign: "center",
                      cursor: "pointer",
                      width: "100%",
                      marginRight: "600px",
                      fontSize: "15px", // Increase text size here
                    }}
                  >
                    All-in-One
                  </div>
                }
                key="1"
              >
                <div style={{ padding: 20 }}>
                  <h4>All-in-One Content</h4>
                  {renderServerDetails(serverInfoAllInOne)}
                </div>
              </Tabs.TabPane>

              {/* Multinode Tab */}
              <Tabs.TabPane disabled={disabledTabs["1"]}
                tab={
                  <div
                    style={{
                      padding: "10px 30px",
                      color:"#000",
                      borderRadius: borderRadiusLG,
                      textAlign: "center",
                      cursor: 'unset',
                      width: "100%",
                      marginRight: '600px',
                      fontSize: "15px", // Increase text size here
                    }}
                  >
                    Multinode
                  </div>
                }
                key="2"
              >
                <div style={{ padding: 20 }}>
                  <h4>Multinode Content</h4>
                  {renderServerDetails(serverInfoMultinode)}
                </div>
              </Tabs.TabPane>
            </Tabs>
          </div>
        </Content>

        {/* Modal for confirmation */}
        <Modal
          title={`Confirm ${actionType}`}
          visible={isModalVisible}
          onOk={handleConfirmAction}
          onCancel={handleCancelAction}
          okText="Confirm"
          cancelText="Cancel"
        >
          <p>Are you sure you want to {actionType?.toLowerCase()} the server?</p>
        </Modal>
      </Layout>
    </Layout1>
  );
};

export default Iaas;
