import React, { useState, useEffect } from 'react';
import Layout from '../Components/layout';
import { Divider, Table, Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate,} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DataTable = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const navigate = useNavigate();
    const [isRotating] = useState(false);

    useEffect(() => {
        scanNetwork();
    }, []);

    const handleDeploy = () => {
        navigate('/validation', { state: { selectedNodes: selectedRows } });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
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


    const columns = [
        {
            title: 'IP Address',
            dataIndex: 'ip',
            key: 'ip',
        },
        {
            title: 'MAC Address',
            dataIndex: 'mac',
            key: 'mac',
        },
        {
            title: 'Last Seen',
            dataIndex: 'last_seen',
            key: 'last_seen',
        },
    ];

    return (
        <Layout>
            <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
                <Breadcrumb.Item>Deployment</Breadcrumb.Item>
                <Breadcrumb.Item>Discovery</Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>Discovery</h2><a style={{ marginRight: '86%', marginTop: '0.5%' }} className={`button ${isRotating ? 'rotating' : ''}`} onClick={handleRefresh}>
                    <FontAwesomeIcon icon={faArrowsRotate} size="1x" /> </a>
                <Button size={'middle'} style={{ marginLeft: '-10%', width: '75px' }} type="primary" onClick={handleDeploy}
                    disabled={selectedRows.length === 0}>Next</Button>

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
                    tip: "Scanning...", // Add a description below the loader
                }}
            />
        </Layout>
    );
};

export const Discovery = () => {
    return <DataTable />;
};

export default Discovery;
