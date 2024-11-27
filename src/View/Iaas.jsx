import React from 'react';
import Layout1 from '../Components/layout';
import { theme, Layout, Result, Divider } from 'antd';

const { Content } = Layout;

const Iaas = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout1>
      <Layout>
        <Content style={{ margin: "16px 16px" }}>
          <div style={{
            padding: 30,
            minHeight: "auto",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}>
          <h3 style={{marginTop: '20px'}}>Infrastructure as a Service (IaaS)</h3> 
	  <Divider />
	  </div>
	</Content>
      </Layout>
    </Layout1>
  );
};

export default Iaas;
