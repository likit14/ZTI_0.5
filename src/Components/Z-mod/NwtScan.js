import React, { useRef, useState, useEffect } from 'react';
import { Divider, Table, Button, Breadcrumb, Input, Space } from 'antd';
import { HomeOutlined, SearchOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import Highlighter from 'react-highlight-words';
import axios from 'axios';

const DataTable = ({ onStart }) => { 
    const [isScanning, setIsScanning] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    useEffect(() => {
        scanNetwork();
    }, []);

    const scanNetwork = async () => {
        setIsScanning(true);
        try {
            const response = await axios.get('http://localhost:8000/scan');
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

    const handleNextClick = () => {
        if (selectedRows.length > 0) {
            onStart(); // Call the function passed from App.js to go to the next tab
        } else {
            // Optionally, you can handle cases where no rows are selected
            console.log("No rows selected!");
        }
    };

    const getColumnSearchProps = (dataIndex) => ({
        // ... existing column search props
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
                <h2 style={{ margin: 0 }}>Discovery</h2>
                <a
                    style={{ marginRight: '83%', marginTop: '0.5%', color:'#1677FF' }}
                    onClick={handleRefresh}
                >
                    <FontAwesomeIcon icon={faArrowsRotate} size="1x" />
                </a>
                <Button
                    size="middle"
                    style={{ marginLeft: '-10%', width: '75px' }}
                    type="primary"
                    disabled={selectedRows.length === 0}
                    onClick={handleNextClick} // Call handleNextClick on button click
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
                    onChange: (selectedRowKeys, selectedRows) => {
                        setSelectedRows(selectedRows);
                    },
                }}
                loading={{
                    spinning: isScanning,
                    tip: "Scanning...",
                }}
            />
        </div>
    );
};

export const Discovery = ({ onStart }) => {
    return <DataTable onStart={onStart} />;
};

export default Discovery;
