import React, { useEffect } from "react";
import Layout1 from "../layout";
import { Button, Menu, theme,Layout, Dropdown, Col, Divider, Row } from "antd";
import { useNavigate } from "react-router-dom";
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

  const style = {
    background: '#fff',
    padding: '36px 20px',
    marginTop: '19px',
    marginRight: '13px',
    marginLeft: '39px',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '10px'
  
  
  };

  const {Content} = Layout;
export default function Zti({children}) {
  const navigate = useNavigate();
  const handleRedirect = () => {
    navigate("/newcloud"); // replace with your actual path
  };
  const handleRedirectAddNode = () => {
    navigate("/addnodes"); // replace with your actual path
  };
  const handleRedirectRemoveNode = () => {
    navigate("/removenodes"); // replace with your actual path
  };
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout1 >
      <Row
        gutter={{
          xs: 1,
          sm: 16,
          md: 30,
          lg: 32,
        }}
      >
        <Col
          className="gutter-row"
          span={6}
          onClick={handleRedirect}
          style={style}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <CloudTwoTone style={{ fontSize: "45px", marginRight: "8px" }} />{" "}
            {/* Increase icon size and add spacing */}
            <span
              style={{
                fontSize: "16px",
                fontWeight: "500",
                marginLeft: "17px",
              }}
            >
              New Cloud
            </span>{" "}
            {/* Add text with styling */}
          </div>
        </Col>
        <Col
          className="gutter-row"
          span={6}
          onClick={handleRedirectAddNode}
          style={style}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <CloudTwoTone style={{ fontSize: "45px", marginRight: "8px" }} />{" "}
            {/* Increase icon size and add spacing */}
            <span
              style={{
                fontSize: "16px",
                fontWeight: "500",
                marginLeft: "17px",
              }}
            >
              Add Nodes
            </span>{" "}
            {/* Add text with styling */}
          </div>
        </Col>
        <Col
          className="gutter-row"
          span={6}
          onClick={handleRedirectRemoveNode}
          style={style}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <CloudTwoTone style={{ fontSize: "45px", marginRight: "8px" }} />{" "}
            {/* Increase icon size and add spacing */}
            <span
              style={{
                fontSize: "16px",
                fontWeight: "500",
                marginLeft: "17px",
              }}
            >
              Remove Nodes
            </span>{" "}
            {/* Add text with styling */}
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
    </Layout1>
  );
}
