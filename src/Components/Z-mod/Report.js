import React, { useEffect, useState } from 'react';
import { Breadcrumb, Card } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const getCloudNameFromMetadata = () => {
  let cloudNameMeta = document.querySelector('meta[name="cloud-name"]');
  return cloudNameMeta ? cloudNameMeta.content : null;
};

const Report = ({ ibn }) => {
  const [urls, setUrls] = useState(null); // State to store the URLs
  const cloudName = getCloudNameFromMetadata();

  // Fetch URLs from the backend API when `ibn` changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the credentials from the backend API using `ibn`
        const response = await fetch("http://192.168.249.100:9909/api/credentials", {
          headers: { 'ibn': ibn } // Pass the `ibn` value in the request headers
        });

        if (!response.ok) {
          throw new Error('Error fetching data');
        }

        const data = await response.json();
        setUrls(data); // Set the fetched URLs data to the state
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (ibn) {
      fetchData(); // Call the fetch data function if `ibn` is provided
    }
  }, [ibn]); // Run the effect when `ibn` changes

  if (!urls) {
    return <div>Loading...</div>; // Loading state while data is being fetched
  }

  return (
    <div style={{ padding: '20px' }}>
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
      <div style={{ paddingTop: '20px' }}>
        <Card
          title={`${cloudName} Cloud`}
          bordered={false}
          style={{
            width: 800,
            height: 200,
            boxShadow: '1px 4px 16px rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
          }}
        >
          <p><b>Skyline Dashboard :</b> <a href={urls.skylineDashboardUrl} target="_blank" rel="noopener noreferrer">{urls.skylineDashboardUrl}</a></p>
          <p><b>Ceph Dashboard :</b> <a href={urls.cephDashboardUrl} target="_blank" rel="noopener noreferrer">{urls.cephDashboardUrl}</a></p>
        </Card>
      </div>
    </div>
  );
};

export default Report;
