import React, { useState, useEffect } from 'react';
import { Divider, Table, Breadcrumb, Button } from "antd";
import { HomeOutlined } from "@ant-design/icons";

const Validation = ({ selectedNodes }) => {
  const [validationResults, setValidationResults] = useState({});

  const columns = [
    {
      title: "IP Address",
      dataIndex: "ip",
      key: "ip",
      align: "center",
    },
    {
      title: "Validate",
      dataIndex: "validate",
      key: "validate",
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleValidate(record.ip)}
          style={{ width: "80px" }}
        >
          Validate
        </Button>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (_, node) => (
        <span
          style={{
            color: validationResults[node.ip]
              ? validationResults[node.ip].status === "Passed"
                ? "#28a745"
                : "#dc3545"
              : "red",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {validationResults[node.ip]
            ? validationResults[node.ip].status
            : "Not validated"}
        </span>
      ),
    },
    {
      title: "Result",
      dataIndex: "result",
      key: "result",
      align: "center",
    },
    {
      title: "Deploy",
      dataIndex: "deploy",
      key: "deploy",
      align: "center",
    },
  ];

  const handleValidate = (ip) => {
    console.log(`Validating node with IP: ${ip}`);
    // Add your validation logic here
  };

  return (
    <div style={{ padding: "24px" }}>
      <Breadcrumb style={{ marginBottom: "16px" }}>
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>Deployment</Breadcrumb.Item>
        <Breadcrumb.Item>Validation</Breadcrumb.Item>
      </Breadcrumb>
      <Divider />
      <Table
        columns={columns}
        dataSource={selectedNodes}
        rowKey="ip"
        pagination={{ pageSize: 4 }}
      />
    </div>
  );
};

export default Validation;
