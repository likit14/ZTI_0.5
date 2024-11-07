import React, { useRef, useState, useEffect } from 'react';
import { Divider, Table, Button, Breadcrumb, Input, Space } from 'antd';
import { HomeOutlined, SearchOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import Highlighter from 'react-highlight-words';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DataTable = ({ onNodeSelect }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [selectedNodes, setSelectedNodes] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    useEffect(() => {
        scanNetwork();
    }, []);

    const handleNextClick = () => {
        onNodeSelect(selectedNodes); // Pass selected nodes to the parent
        // onNext();
    };

    const scanNetwork = async () => {
        setIsScanning(true);
        try {
            const response = await axios.get('http://192.168.249.100:8000/scan');
            setNodes(response.data);
        } catch (error) {
            console.error('Error scanning network:', error);
        } finally {
            setIsScanning(false);
        }
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
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
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
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
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
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const columns = [
        {
            title: 'IP Address',
            dataIndex: 'ip',
            key: 'ip',
            ...getColumnSearchProps('ip'),
        },
        {
            title: 'MAC Address',
            dataIndex: 'mac',
            key: 'mac',
            ...getColumnSearchProps('mac'),
        },
        {
            title: 'Last Seen',
            dataIndex: 'last_seen',
            key: 'last_seen',
            ...getColumnSearchProps('last_seen'),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Breadcrumb style={{ marginBottom: '16px' }}>
                <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
                <Breadcrumb.Item>Deployment</Breadcrumb.Item>
                <Breadcrumb.Item>Discovery</Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h2 style={{ margin: 0 }}>Discovery</h2>
                    <FontAwesomeIcon
                        icon={faArrowsRotate}
                        size="1x"
                        style={{ marginLeft: '8px', color: '#1677ff', cursor: 'pointer' }}
                        onClick={handleRefresh}
                    />
                </div>
                <Button
                    size="middle"
                    style={{ marginLeft: '-10%', width: '75px' }}
                    type="primary"
                    onClick={handleNextClick}
                    disabled={selectedNodes.length === 0}
                >
                    Next
                </Button>
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
                    onChange: page => setCurrentPage(page),
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
