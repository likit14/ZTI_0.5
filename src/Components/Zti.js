import React, { useState, useEffect } from "react";
import img1 from "../Images/ZTi.png";
import img2 from "../Images/favicon.png";
import { useNavigate } from 'react-router-dom';
import {
  MenuFoldOutlined,
  CheckCircleOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DashboardOutlined,
  DeploymentUnitOutlined,
  SyncOutlined,
  TruckOutlined,
  CloudServerOutlined,
  FormOutlined,
  SettingOutlined,
  FileDoneOutlined,
  DatabaseOutlined,
  WifiOutlined,
  FileSearchOutlined,
  ProfileOutlined,
  CloudTwoTone
} from "@ant-design/icons";
import { Button, Layout, Menu, theme, Dropdown, Col, Divider, Row } from "antd";
const style = {
  background: '#fff',
  padding: '36px 20px',
  marginTop: '19px',
  marginRight: '13px',
  marginLeft: '39px',
  borderRadius: '10px',
  // boxShadow: '10px'


};
const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

const AppLayout = ({ children }) => {
  const navigate = useNavigate(); // Move here
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("1");
  const [userData, setUserData] = useState({});
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
    // navigate('/');
  };
  const handleRedirect = () => {
    navigate('/'); // replace with your actual path
  };
  const items = [
    {
      key: "1",
      label: "My Account",
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "2",
      label: "Profile",
      icon: <UserOutlined />,
    },
    {
      key: "3",
      label: "Settings",
      icon: <SettingOutlined />,
    },
    {
      key: "4",
      label: "Logout",
      danger: true,
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "2",
      label: "ZTi Wizard",
      icon: <DeploymentUnitOutlined />,
      // children: [
      //   { key: "3", label: "New Cloud" },
      //   { key: "4", label: "Add Nodes" },
      //   { key: "5", label: "Remove Nodes" },
      // ],
    },
    {
      key: "6",
      icon: <CloudServerOutlined />,
      label: "Iaas",
    },
    {
      key: "7",
      icon: <FileDoneOutlined />,
      label: "HPC/AI Workbench",
    },
    {
      key: "8",
      icon: <DatabaseOutlined />,
      label: "DaaS/VDI",
    },
    {
      key: "9",
      icon: <FileSearchOutlined />,
      label: "SIEM",
    },
    {
      key: "10",
      icon: <WifiOutlined />,
      label: "NOC",
    },
    {
      key: "11",
      icon: <SyncOutlined />,
      label: "Lifecycle Mgmt",
    },
    {
      key: "12",
      icon: <TruckOutlined />,
      label: "Migration(v-v)",
    },
    {
      key: "13",
      icon: <CheckCircleOutlined />,
      label: "Compliance",
    },
    {
      key: "14",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      key: "15",
      icon: <ProfileOutlined />,
      label: "Administration",
    },
  ];

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("loginDetails"));
      if (data && data.data) {
        setUserData(data.data);
      }
    } catch (error) {
      console.error("Error parsing login details from localStorage:", error);
    }
  }, []);

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "black" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ padding: "16px", textAlign: "center" }}>
          <img
            src={collapsed ? img2 : img1}
            alt="Logo"
            style={{
              width: collapsed ? "40px" : "80%",
              maxWidth: "200px",
              borderRadius: "8px",
              transition: "all 0.3s ease-in-out",
              opacity: collapsed ? 0.8 : 1,
            }}
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          selectedKeys={[selectedKey]}
          onClick={(e) => setSelectedKey(e.key)}
          inlineCollapsed={collapsed}
          style={{ backgroundColor: "transparent" }}
        >
          {menuItems.map((item) => {
            if (item.children) {
              return (
                <SubMenu key={item.key} icon={item.icon} title={item.label}>
                  {item.children.map((child) => (
                    <Menu.Item
                      key={child.key}

                    >
                      {child.label}
                    </Menu.Item>
                  ))}
                </SubMenu>
              );
            }
            return (
              <Menu.Item
                key={item.key}
                icon={item.icon}
              >
                {item.label}
              </Menu.Item>
            );
          })}
        </Menu>
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 25,
              marginBottom: 10,
              background: "transparent",
              border: "none",
            }}
          />
          <div style={{ marginLeft: "auto", marginRight: 16 }}>
            <span style={{ color: "#1677ff" }}>
              &nbsp; {userData.companyName}&nbsp;{" "}
            </span>
          </div>
          <Dropdown
            menu={{
              items,
            }}
            style={{
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              backgroundColor: "#fff",
              marginRight: "14px",
              color: "black"
            }}
          >
            <a onClick={(e) => e.preventDefault()} style={{ marginRight: '10px' }}>
              <UserOutlined style={{ fontSize: "16px" }} />
            </a>
          </Dropdown>
        </Header>
        <Row
          gutter={{
            xs: 1,
            sm: 16,
            md: 30,
            lg: 32,
          }}
        >
          <Col className="gutter-row" span={6} onClick={handleRedirect} style={style}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CloudTwoTone style={{ fontSize: '45px', marginRight: '8px' }} /> {/* Increase icon size and add spacing */}
              <span style={{ fontSize: '16px', fontWeight: '500', marginLeft: '17px' }}>New Cloud</span> {/* Add text with styling */}
            </div>
          </Col>
          <Col className="gutter-row" span={6} style={style} >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CloudTwoTone style={{ fontSize: '45px', marginRight: '8px' }}/> {/* Increase icon size and add spacing */}
              <span style={{ fontSize: '16px', fontWeight: '500' ,marginLeft: '17px'}}>Add Nodes</span> {/* Add text with styling */}
            </div>
          </Col>
          <Col className="gutter-row" span={6} style={style} >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CloudTwoTone style={{ fontSize: '45px', marginRight: '8px' }} /> {/* Increase icon size and add spacing */}
              <span style={{ fontSize: '16px', fontWeight: '500', marginLeft: '17px' }}>Remove Nodes</span> {/* Add text with styling */}
            </div>
          </Col>
        </Row>
        <Content style={{ margin: "16px 16px" }}>
          <div
            style={{
              padding: 30,
              minHeight: "auto",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          &copy;
          <a
            href="https://pinakastra.com"
            style={{ color: "black", textDecoration: "none" }}
          >
            {" "}
            Turn-Key Cloud Platform for Academia, Research & Enterprises
          </a>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
