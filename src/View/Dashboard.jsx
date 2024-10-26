import React from 'react'
import Layout1 from '../Components/layout'
import {theme, Layout } from 'antd'
const {Content} = Layout;
const Dashboard = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout1>
     <Layout>
     <Content style={{ margin: "16px 16px" }}>
        <div
          style={{
            padding: 30,
            minHeight: "auto",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          Dashboard
        </div>
      </Content>
     </Layout>
    </Layout1>
  )
}

export default Dashboard