import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Table, Checkbox, Popover, Form, Input } from "antd";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Validation = ({ selectedNodes }) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [validationResults, setValidationResults] = useState({});
  const [validatingNode, setValidatingNode] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bmcFormVisibleStates, setBmcFormVisibleStates] = useState({});
  const [currentNode, setCurrentNode] = useState(null);
  const [bmcDetails, setBmcDetails] = useState({
    ip: "",
    username: "",
    password: "",
  });
  const [scanResults, setScanResults] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const [interfaces, setInterfaces] = useState([]);
  const itemsPerPage = 4;
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    fetchScanResults();
  }, []);

  const fetchScanResults = async () => {
    try {
      const response = await axios.get("http://192.168.249.101:8000/scan");
      setScanResults(response.data);
    } catch (error) {
      console.error("Error fetching scan results:", error);
    }
  };

  // const fetchValidationData = async () => {
  //     try {
  //         const response = await axios.get('http://192.168.249.101:8000/validate');
  //         setValidationData(response.data);
  //         MySwal.close();
  //     } catch (error) {
  //         console.error('Error fetching validation data:', error);
  //     }
  // };

  const validateNode = (node) => {
    setValidatingNode(node);
    setCurrentNode(node);
    setBmcDetails({ ...bmcDetails, ip: node.ip });
    toggleBmcFormVisibility(node.ip, true);
  };

  const handleBack = () => {
    navigate(-1);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleCheckboxChange = (event, node) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      setSelectedRows([...selectedRows, node]);
    } else {
      setSelectedRows(
        selectedRows.filter((selectedRow) => selectedRow.ip !== node.ip)
      );
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleBmcFormVisibility = (ip, visibility) => {
    setBmcFormVisibleStates((prevState) => ({
      ...prevState,
      [ip]: visibility,
    }));
  };

  const handleBmcFormSubmit = async (event) => {
    event.preventDefault();
    console.log("Form submitted with data:", bmcDetails); 
    toggleBmcFormVisibility(currentNode.ip, false); 
    // Show a loading indicator using SweetAlert
    MySwal.fire({
      title: "Validation in Progress",
      html: "Please wait while we process your request...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // First request to initiate the live OS boot
      await axios.post("http://192.168.249.101:9909/api/boot", {
        osType: "live",
      });
      console.log("Live OS boot initiated");

      // Send BMC details for PXE boot
      const response = await axios.post(
        "http://192.168.249.101:8000/set_pxe_boot",
        {
          ip: bmcDetails.ip,
          username: bmcDetails.username,
          password: bmcDetails.password,
        }
      );

      console.log("BMC Details submitted:", bmcDetails);
      console.log("Server response:", response.data);

      // Wait for 2 minutes before continuing
      await new Promise((resolve) => setTimeout(resolve, 120000));

      // Close the SweetAlert loading indicator
      MySwal.close();

      // Additional actions after waiting can be placed here
    } catch (error) {
      console.error("Error in form submission:", error);
      MySwal.fire({
        icon: "error",
        title: "Failed",
        text: "There was an issue with the validation. Please try again.",
      });
    }
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
              onFinish={handleBmcFormSubmit}
              style={{ width: "200px", height: "222px" }}
            >
              <Form.Item
                label="BMC IP"
                name="bmcIp"
                style={{ marginBottom: "1px" }}
              >
                <Input
                  placeholder="Enter BMC IP"
                  value={bmcDetails.ip}
                  onChange={(e) =>
                    setBmcDetails({ ...bmcDetails, ip: e.target.value })
                  }
                />
              </Form.Item>
              <Form.Item
                label="Username"
                name="username"
                style={{ marginBottom: "1px" }}
              >
                <Input
                  placeholder="Enter Username"
                  value={bmcDetails.username}
                  onChange={(e) =>
                    setBmcDetails({ ...bmcDetails, username: e.target.value })
                  }
                />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                style={{ marginBottom: "1px" }}
              >
                <Input.Password
                  placeholder="Enter Password"
                  value={bmcDetails.password}
                  onChange={(e) =>
                    setBmcDetails({ ...bmcDetails, password: e.target.value })
                  }
                />
              </Form.Item>
              <Form.Item style={{ marginTop: "4px", marginLeft: "6px" }}>
                <Button
                  type="primary"
                  style={{ width: "80px" }}
                  htmlType="submit"
                >
                  Submit
                </Button>
                <Button
                  type="link"
                  onClick={() => toggleBmcFormVisibility(record.ip, false)}
                  style={{ paddingLeft: "160px", margin: "-100px" }}
                >
                  Close
                </Button>
              </Form.Item>
            </Form>
          }
          title="Enter BMC Credentials"
          trigger="click"
          visible={bmcFormVisibleStates[record.ip] || false}
          onVisibleChange={(visible) =>
            toggleBmcFormVisibility(record.ip, visible)
          }
          placement="right"
        >
          <Button
            type="primary"
            style={{ width: "80px" }}
            onClick={() => validateNode(record)}
          >
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
    <div>
      <h2>Node Validation</h2>
      <Table
        dataSource={selectedNodes}
        columns={columns}
        pagination={{
          current: currentPage,
          pageSize: itemsPerPage,
          onChange: handlePageChange,
        }}
        rowKey="ip"
      />
    </div>
  );
};

export default Validation;
