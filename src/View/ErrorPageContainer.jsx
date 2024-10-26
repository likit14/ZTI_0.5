import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import Layout1 from '../Components/layout';

const App = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate('/'); // Redirects to the home page or specify any route as needed
  };

  return (
    <Layout1>
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={ <Button
        size={'middle'}
        style={{ width: '85px' }}
        type="primary"
        onClick={handleBackHome}
    > Back Home
        
    </Button>}
    />
    </Layout1>
  );
};

export default App;
