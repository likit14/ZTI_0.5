import React, { useEffect } from 'react';
import Layout1 from '../Components/layout';
import { theme, Layout, Result, notification } from 'antd';

const { Content } = Layout;

const Dashboard = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    // Check if the login notification flag is set
    if (localStorage.getItem('loginNotification') === 'true') {
      // Show the notification
      notification.success({
        message: "Welcome",
        description: "You have successfully logged in!",
        placement: "topRight",
      });

      // Immediately remove the flag from localStorage to prevent it on refresh
      localStorage.removeItem('loginNotification');
    }
  }, []);

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
            <Result
              status="404"
              // title="404"
              // subTitle="Sorry, the page you visited does not exist."
            />
          </div>
        </Content>
      </Layout>
    </Layout1>
  );
};

export default Dashboard;
