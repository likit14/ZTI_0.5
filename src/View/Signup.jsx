import React, { useState } from 'react';
import '../Styles/Signup.css';
import { LockOutlined, HomeOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Alert } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import tick from '../Images/tick.gif';
import img1 from '../Images/ZTi.png';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [registeredUser, setRegisteredUser] = useState('');
    const [userId, setUserId] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { companyName, email, password, confirmPassword } = formData;

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (!/[A-Z]/.test(password)) {
            setError('Password must contain at least one uppercase letter!');
            return;
        }

        if (!/[a-z]/.test(password)) {
            setError('Password must contain at least one lowercase letter!');
            return;
        }

        if (!/\d/.test(password)) {
            setError('Password must contain at least one digit!');
            return;
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            setError('Password must contain at least one special character!');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/register', { companyName, email, password });
            setRegistrationSuccess(true);
            setRegisteredUser(companyName);
            setUserId(response.data.userId);
            setFormData({
                companyName: '',
                email: '',
                password: '',
                confirmPassword: '',
            });
            setError('');
        } catch (err) {
            console.error(err);
            setError('Error registering user');
        }
    };

    const handleNavigate = () => {
        const loginDetails = {
            loginStatus: false
        };
        localStorage.setItem('loginDetails', JSON.stringify(loginDetails));
        navigate('/');
    };

    return (
        <div className="App">
            <div className="container-fluid ps-md-0">
                <div className="row g-0">
                    <div className="d-md-flex col-md-8 col-lg-6 bg-image"></div>
                    <div className="col-md-8 col-lg-6">
                        <div className="container">
                            {/* <div className="form-container"> */}
                            <div className="registration-form">
                                <img src={img1} alt="Logo" className="logo" />
                                {registrationSuccess ? (
                                    <div className="success-message">
                                        <img src={tick} alt="Success Tick" className="tick" />
                                        <h2>Registration Success</h2>
                                        <p>Your account name is: <strong>{registeredUser}</strong></p>
                                        <p>Please check your <b>Email</b> for your <b>UserID</b></p>
                                        <div className="login-prompt">
                                            <p>Please <Link to="/">login</Link> to continue</p>
                                        </div>
                                    </div>
                                ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
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
                                    <div className="form-group">
                                        <label>Email:</label>
                                        <Input
                                            prefix={<MailOutlined />}
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email address"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Password:</label>
                                        <Input
                                            prefix={<LockOutlined />}
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter your password"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm Password:</label>
                                        <Input
                                            prefix={<LockOutlined />}
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm your password"
                                            required
                                        />
                                    </div>
                                    {error && <Alert message={error} type="error" showIcon />}
                                    <Button type="primary" htmlType="submit">Register</Button>
                                </form>
                                )}
                                {!registrationSuccess && (
                                <div className="login-prompt">
                                    <p>or</p>
                                    <p><Link to="/">Already Registered?/Login</Link></p>
                                </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
