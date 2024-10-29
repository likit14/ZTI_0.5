import React, { useState } from 'react';
import styles from '../Styles/Login.module.css';
import { LockOutlined, UserOutlined, HomeOutlined, } from '@ant-design/icons';
import { Button, Alert, Input } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import img1 from '../Images/ZTi.png';
import { Link, useNavigate } from 'react-router-dom';

const Login = (props) => {
  const { checkLogin } = props;
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const [formData, setFormData] = useState({
    id: '',
    companyName: '',
    password: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id, companyName, password } = formData;
  
    try {
      const response = await axios.post('http://192.168.249.101:5000/api/login', { id, companyName, password });
      if (response.data.success) {
        const loginDetails = {
          loginStatus: true,
          data: response.data.data
        };
        localStorage.setItem('loginDetails', JSON.stringify(loginDetails));
        localStorage.setItem('loginNotification', 'true'); // Set the login notification flag
        checkLogin(true);
        
        // Redirect to dashboard
        navigate('/', { state: { notification: 'Login Successful! Welcome back!' } });
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setError('Invalid credentials');
    }
  };

  return (
    <div className={styles.App}>
      <div className="container-fluid ps-md-0">
        <div className="row g-0">
          <div className={`d-md-flex col-md-8 col-lg-6 ${styles.bgImage}`}></div>
          <div className="col-md-8 col-lg-6">
            <div className={styles.container} >
              <div className={styles.loginForm}>
                <img src={img1} alt="Logo" className={styles.logo} />
                <form name="login" onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <label>User ID:</label>
                    <Input
                      prefix={<UserOutlined />}
                      type="text"
                      name="id"
                      value={formData.id}
                      onChange={handleChange}
                      placeholder="Enter your user ID"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Company Name:</label>
                    <Input
                      prefix={<HomeOutlined />}
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Enter your company name"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Password:</label>
                    <Input.Password
                      prefix={<LockOutlined />}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  {error && <Alert message={error} type="error" showIcon />}
                  <Button type="primary" htmlType="submit">Login</Button>
                </form>
                <div className={styles.loginPrompt}>
                  <p>or</p>
                  <p><Link to="/signup">Not registered? Sign up</Link></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
