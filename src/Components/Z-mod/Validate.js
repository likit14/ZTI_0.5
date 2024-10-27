import React from 'react';
import { Divider, Table, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const Validation = ({ selectedNodes }) => {
    const columns = [
        {
            title: 'IP Address',
            dataIndex: 'ip',
            key: 'ip',
        },
        {
            title: 'Validate',
            dataIndex: 'validate',
            key: 'validate',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Result',
            dataIndex: 'result',
            key: 'result',
        },
        {
            title: 'Deploy',
            dataIndex: 'deploy',
            key: 'deploy',
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Breadcrumb style={{ marginBottom: '16px' }}>
                <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
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
