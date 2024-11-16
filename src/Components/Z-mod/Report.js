import React from 'react'
import { Breadcrumb, Card } from 'antd';
import { HomeOutlined } from '@ant-design/icons';


const getCloudNameFromMetadata = () => {
  let cloudNameMeta = document.querySelector('meta[name="cloud-name"]');
  return cloudNameMeta ? cloudNameMeta.content : null; // Return the content of the meta tag
};

const Report = () => {
const cloudName = getCloudNameFromMetadata();

  return (
    <div style={{ padding: '20px' }}> {/* Add padding to keep spacing */}
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
        <Breadcrumb.Item>Deployment</Breadcrumb.Item>
        <Breadcrumb.Item>Discovery</Breadcrumb.Item>
        <Breadcrumb.Item>Validation</Breadcrumb.Item>
        <Breadcrumb.Item>Report</Breadcrumb.Item>
      </Breadcrumb>
      <div>
        <h4>Deployment Summary</h4>
      </div>
      <div style={{paddingTop:'20px'}}>
        <Card
          title={`${cloudName} Cloud`}
          bordered={false}
          style={{
            width: 800,
            height:200,
            boxShadow: '1px 4px 16px rgba(0, 0,0, 0.2)', // Add shadow effect
            borderRadius: '8px', // Optional: Add rounded corners
            
          }}
        >
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </Card>
      </div>
    </div>
  )
}

export default Report