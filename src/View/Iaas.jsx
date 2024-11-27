import React from 'react';
import Layout1 from '../Components/layout';
import { theme, Layout, Result } from 'antd';

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
          <h2>Infrastructure as a Service (Iaas)</h2> 
          </div>
        </Content>
      </Layout>
    </Layout1>
  );
};

export default Iaas;
