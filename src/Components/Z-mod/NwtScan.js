import React, { useRef, useState, useEffect } from "react";
import {
  message,
  Divider,
  Table,
  Button,
  Breadcrumb,
  Input,
  Space,
  Alert,
} from "antd";
import { HomeOutlined, SearchOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CloudOutlined } from "@ant-design/icons";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import Highlighter from "react-highlight-words";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const getCloudNameFromMetadata = () => {
  let cloudNameMeta = document.querySelector('meta[name="cloud-name"]');
  return cloudNameMeta ? cloudNameMeta.content : null; // Return the content of the meta tag
};

const DataTable = ({ onNodeSelect }) => {
  const cloudName = getCloudNameFromMetadata();
  const [isScanning, setIsScanning] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [subnet, setSubnet] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const [warningMessage, setWarningMessage] = useState(null);

  useEffect(() => {
    scanNetwork();
  }, []);

  const handleNextClick = () => {
    onNodeSelect(selectedNodes);
    // onNext();
  };

  const handleDefaultSubnetScan = async () => {
    setIsScanning(true); // Start loading
    try {
      // Fetch the local subnet from the backend
      const response = await axios.get("http://192.168.249.100:8000/scan");

      if (response.data && Array.isArray(response.data)) {
        setSubnet("");  // Clear any manually entered subnet
        setNodes(response.data); // Directly update nodes with the fetched data
      } else {
        messageApi.error("No active nodes found in the local network.");
      }
    } catch (error) {
      console.error("Error getting local subnet:", error);
      messageApi.error("Failed to detect the local network. Please enter a subnet manually.");
    } finally {
      setIsScanning(false); // End loading
    }
  };

  const scanNetwork = async (subnet = "") => {
    setIsScanning(true); // Start loading
    try {
      if (!subnet) {
        setWarningMessage("Please enter a subnet to scan.");
        return;
      }

      const response = await axios.get("http://192.168.249.100:8000/scan", {
        params: { subnet },
      });

      if (response.data && Array.isArray(response.data)) {
        setNodes(response.data); // Update nodes with the active nodes found in the scan
        if (response.data.length === 0) {
          messageApi.info("No active nodes found in the specified network.");
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        messageApi.error("Invalid subnet format. Please enter a valid CIDR subnet.");
      } else {
        messageApi.error("An unexpected error occurred while scanning the network.");
      }
    } finally {
      setIsScanning(false); // End loading
    }
  };

  const handleSubnetChange = (e) => {
    const value = e.target.value;
    setSubnet(value);

    if (value) {
      setWarningMessage(null);
    } else {
      setWarningMessage("Please enter a subnet to scan.");
    }
  };

  const handleSubnetScan = () => {
    scanNetwork(subnet); // Scan using the entered subnet
    setWarningMessage(null); // Clear the warning message when a scan starts
  };

  const handleRefresh = () => {
    scanNetwork();
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: "IP Address",
      dataIndex: "ip",
      key: "ip",
      ...getColumnSearchProps("ip"),
    },
    {
      title: "MAC Address",
      dataIndex: "mac",
      key: "mac",
      ...getColumnSearchProps("mac"),
    },
    {
      title: "Last Seen",
      dataIndex: "last_seen",
      key: "last_seen",
      ...getColumnSearchProps("last_seen"),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {contextHolder}
      <h5>
        <CloudOutlined />
        &nbsp; &nbsp;{cloudName} Cloud 
      </h5>
      <Breadcrumb style={{ marginBottom: "16px" }}>
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>Deployment</Breadcrumb.Item>
        <Breadcrumb.Item>Discovery</Breadcrumb.Item>
      </Breadcrumb>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Discovery</h2>
        </div>
        <div>
          {warningMessage && (
            <Alert
              message={warningMessage}
              type="warning"
              icon={<SearchOutlined />}
              style={{
                marginLeft: "40px",
                flex: 1,
                marginBottom: "5px",
                maxWidth: "300px",
                wordBreak: "break-word",
              }}
            />
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            placeholder="Enter subnet (e.g., 192.168.1.0/24)"
            value={subnet}
            onChange={handleSubnetChange}
            style={{
              marginRight: "8px",  // Reduced margin to move closer to buttons
              marginBottom: "3px"
            }}
            autoFocus
          />
          <Button
            type="primary"
            style={{
              marginRight: "8px",
              marginBottom: "9px",
              width: "100px",
            }}
            onClick={handleSubnetScan}
            disabled={!subnet}
          >
            Scan Subnet
          </Button>
          <Button
            type="default"
            style={{
              width: "120px",
              marginRight: "100px",
              marginBottom: "9px",
            }}
            onClick={handleDefaultSubnetScan}
          >
            Default Subnet
          </Button>
          <Button
            size="middle"
            style={{
              marginLeft: "8px",
              width: "75px",
              marginBottom: "9px"
            }}
            type="primary"
            onClick={handleNextClick}
            disabled={selectedNodes.length === 0}
          >
            Next
          </Button>
        </div>
      </div>
      <Divider />
      <Table
        columns={columns}
        dataSource={nodes}
        size="middle"
        rowKey="ip"
        pagination={{
          current: currentPage,
          pageSize: itemsPerPage,
          onChange: (page) => setCurrentPage(page),
        }}
        rowSelection={{
          onChange: (_, selectedNodes) => setSelectedNodes(selectedNodes),
        }}
        loading={{
          spinning: isScanning,
          tip: "Scanning...",
        }}
      />
    </div>
  );
};

export const Discovery = ({ onNodeSelect }) => {
  return <DataTable onNodeSelect={onNodeSelect} />;
};

export default Discovery;
