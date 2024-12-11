import React, { useEffect } from 'react';
import Layout1 from '../Components/layout';
import { theme, Layout, Result, notification, Card } from 'antd';

const { Content } = Layout;

const Dashboard = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    // Check if the login notification flag is set
    if (sessionStorage.getItem('loginNotification') === 'true') {
      // Show the notification
      notification.success({
        message: "Welcome",
        description: "You have successfully logged in!",
        placement: "topRight",
      });

      // Immediately remove the flag from localStorage to prevent it on refresh
      sessionStorage.removeItem('loginNotification');
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
            <h2>Dashboard</h2>
          </div>




          <div
            style={{
              padding: 30,
              minHeight: "auto",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              marginTop: "10px",
              display: "flex",                // Enable flexbox
              justifyContent: "space-between", // Distribute space evenly between the cards
              flexWrap: "wrap",               // Allow wrapping if the screen size is smaller
            }}
          >
            <Card
              title="TITLE 1"
              style={{
                width: "30%",   // Each card takes up 30% of the container width
                marginBottom: "20px",  // Add space below the cards
              }}
            >
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>

            </Card>

            <Card
              title="TITLE 2"
              style={{
                width: "30%",   // Each card takes up 30% of the container width
                marginBottom: "20px",  // Add space below the cards
              }}
            >
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>

            <Card
              title="TITLE 3"
              style={{
                width: "30%",   // Each card takes up 30% of the container width
                marginBottom: "20px",  // Add space below the cards
              }}
            >
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>
            <Card
              title="TITLE 4"
              style={{
                width: "30%",   // Each card takes up 30% of the container width
                marginBottom: "20px",  // Add space below the cards
              }}
            >
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>

            <Card
              title="TITLE 5"
              style={{
                width: "30%",   // Each card takes up 30% of the container width
                marginBottom: "20px",  // Add space below the cards
              }}
            >
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>

            <Card
              title="TITLE 6"
              style={{
                width: "30%",   // Each card takes up 30% of the container width
                marginBottom: "20px",  // Add space below the cards
              }}
            >
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>
            <Card
              title="TITLE 7"
              style={{
                width: "30%",   // Each card takes up 30% of the container width
                marginBottom: "20px",  // Add space below the cards
              }}
            >
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>

            <Card
              title="TITLE 8"
              style={{
                width: "30%",   // Each card takes up 30% of the container width
                marginBottom: "20px",  // Add space below the cards
              }}
            >
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>

            <Card
              title=" TITLE 9"
              style={{
                width: "30%",   // Each card takes up 30% of the container width
                marginBottom: "20px",  // Add space below the cards
              }}
            >
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout1>
  );
};

export default Dashboard;
