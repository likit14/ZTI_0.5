import React, { useState } from 'react';
import { Divider, Table, Breadcrumb, Button, Popover, Input, Form } from "antd";
import { HomeOutlined } from "@ant-design/icons";

const Validation = ({ selectedNodes }) => {
    const [validationResults, setValidationResults] = useState({});
    const [popoverVisible, setPopoverVisible] = useState({});

    const handleValidate = (ip) => {
        console.log(`Validating node with IP: ${ip}`);
        // Add your validation logic here
        setValidationResults((prevResults) => ({
            ...prevResults,
            [ip]: { status: "Passed", result: "Validation successful" },
        }));
        hidePopover(ip); // Close the popover after validation
    };

    const showPopover = (ip) => {
        setPopoverVisible((prev) => ({ ...prev, [ip]: true }));
    };

    const hidePopover = (ip) => {
        setPopoverVisible((prev) => ({ ...prev, [ip]: false }));
    };

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
                <Popover
                    content={
                        <Form
                            layout="vertical"
                            onFinish={() => handleValidate(record.ip)}
                            style={{ width: "200px", height: "222px" }}
                        >
                            <Form.Item label="BMC IP" name="bmcIp" style={{ marginBottom: "1px" }}>
                                <Input placeholder="Enter BMC IP" />
                            </Form.Item>
                            <Form.Item label="Username" name="username" style={{ marginBottom: "1px" }}>
                                <Input placeholder="Enter Username" />
                            </Form.Item>
                            <Form.Item label="Password" name="password" style={{ marginBottom: "1px" }}>
                                <Input.Password placeholder="Enter Password" />
                            </Form.Item>
                            <Form.Item style={{ marginTop: "4px", marginLeft:"6px"}}>
                                <Button type="primary" style={{width:"80px"}} htmlType="submit">
                                    Submit
                                </Button>
                                <Button
                                    type="link"
                                    onClick={() => hidePopover(record.ip)}
                                    style={{ paddingLeft:"160px" , margin:"-100px"}}
                                >
                                    Close
                                </Button>
                            </Form.Item>
                        </Form>
                    }
                    title="Enter BMC Credentials"
                    trigger="click"
                    visible={popoverVisible[record.ip]}
                    onVisibleChange={(visible) => {
                        if (visible) {
                            showPopover(record.ip);
                        } else {
                            hidePopover(record.ip);
                        }
                    }}
                    placement="right" // Set popover to appear on the right
                >
                    <Button type="primary" style={{ width: "80px" }}>
                        Start
                    </Button>
                </Popover>
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
            render: (_, node) =>
                validationResults[node.ip]
                    ? validationResults[node.ip].result
                    : "No result",
        },
        {
            title: "Deploy",
            dataIndex: "deploy",
            key: "deploy",
            align: "center",
        },
    ];

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
