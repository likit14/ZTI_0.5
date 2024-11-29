import React, { useState } from 'react';
import Layout1 from '../Components/layout';
import { theme, Layout } from 'antd';
import { Tabs } from 'antd';

const { Content } = Layout;

const Iaas = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [activeTab, setActiveTab] = useState("1");

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
              <Tabs.TabPane
                tab={
                  <div
                    style={{
                      padding: "10px 20px",
                      background: activeTab === "1" ? "#1677ff" : colorBgContainer,
                      color: activeTab === "1" ? "#fff" : "#000",
                      borderRadius: borderRadiusLG,
                      textAlign: "center",
                      fontWeight: activeTab === "1" ? "bold" : "normal",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    All-in-One
                  </div>
                }
                key="1"
              >
                <div style={{ padding: 20 }}>
                  <h4>All-in-One Content</h4>
                  {/* Add All-in-One specific content here */}
                </div>
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <div
                    style={{
                      padding: "10px 20px",
                      background: activeTab === "2" ? "#1677ff" : colorBgContainer,
                      color: activeTab === "2" ? "#fff" : "#000",
                      borderRadius: borderRadiusLG,
                      textAlign: "center",
                      fontWeight: activeTab === "2" ? "bold" : "normal",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    Multinode
                  </div>
                }
                key="2"
              >
                <div style={{ padding: 20 }}>
                  <h4>Multinode Content</h4>
                  {/* Add Multinode specific content here */}
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
