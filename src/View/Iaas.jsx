import React, { useState, useEffect } from 'react';
import Layout1 from '../Components/layout';
import { theme, Layout, Card, Collapse, Empty, Spin } from 'antd';
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
                      // background: activeTab === "1" ? "#1677ff" : colorBgContainer,
                      // color: activeTab === "1" ? "#fff" : "#000",
                      color:'#000',
                      borderRadius: borderRadiusLG,
                      textAlign: "center",
                      // fontWeight: activeTab === "1" ? "bold" : "normal",
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
                      // background: activeTab === "2" ? "#1677ff" : colorBgContainer,
                      // color: activeTab === "2" ? "#fff" : "#000",
                      color:"#000",
                      borderRadius: borderRadiusLG,
                      textAlign: "center",
                      // fontWeight: activeTab === "2" ? "bold" : "normal",
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
      </Layout>
    </Layout1>
  );
};

export default Iaas;
