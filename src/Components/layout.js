import React, { useState, useEffect, useCallback } from "react";
import img1 from "../Images/ZTi.png";
import img2 from "../Images/favicon.png";
import logo from "../Images/logo.png";
import { Link } from "react-router-dom";
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
} from "@ant-design/icons";
import { Button, Layout, Menu, theme, Dropdown } from "antd";

const { Header, Content, Footer, Sider } = Layout;

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(
    () => JSON.parse(localStorage.getItem("isSiderCollapsed")) || false
  );
  const [selectedKey, setSelectedKey] = useState("1");
  const [userData, setUserData] = useState({});
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    const savedSelectedKey = localStorage.getItem("selectedMenuKey");
    if (savedSelectedKey) {
      setSelectedKey(savedSelectedKey);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
    localStorage.setItem("selectedMenuKey", e.key);
    forceUpdate();
  };

  const toggleSider = () => {
    setCollapsed(!collapsed);
    localStorage.setItem("isSiderCollapsed", JSON.stringify(!collapsed));
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
      label: (
        <Link to="/" style={{ textDecoration: "none" }}>
          Dashboard
        </Link>
      ),
    },
    {
      key: "2",
      icon: <DeploymentUnitOutlined />,
      label: (
        <Link to="/newcloud" style={{ textDecoration: "none" }}>
          Zti Wizard
        </Link>
      ),
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
          onClick={handleMenuClick}
          selectedKeys={[selectedKey]}
          style={{ backgroundColor: "transparent" }}
        >
          {menuItems.map((item) => (
            <Menu.Item key={item.key} icon={item.icon}>
              {item.label}
            </Menu.Item>
          ))}
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
            onClick={toggleSider}
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
            menu={{ items }}
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
              color: "black",
            }}
          >
            <a
              onClick={(e) => e.preventDefault()}
              style={{ marginRight: "10px" }}
            >
              <UserOutlined style={{ fontSize: "16px" }} />
            </a>
          </Dropdown>
        </Header>
        <Content style={{ margin: "16px 16px" }}>{children}</Content>
        <Footer
          style={{ textAlign: "center", color: "#4A90E2", padding: "1px" }}
        >
          <img
            src={logo}
            alt="Pinakastra Logo"
            style={{ width: "90px", marginBottom: "5px" }}
          />
          <div style={{ marginTop: "3px", fontSize: "9px", color: "#4A90E2" }}>
            &copy;2023 Pinakastra, Inc. All rights reserved. Pinakastra is a
            trademark of Pinakastra Computing Pvt Ltd.
          </div>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
