const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const authRoutes = require('./authRoutes'); // Adjust the path as needed
const cors = require('cors');
const loginRoutes = require('./loginRoutes'); // New file for login
const nodemailer = require('nodemailer'); // Import nodemailer library
const bcrypt = require('bcrypt'); // Import bcrypt library
require('dotenv').config(); // Load environment variables

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
}));

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', loginRoutes); // Use the login routes
app.use('/api', authRoutes);

// Use session middleware (if you are using sessions for authentication)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key', // Use environment variable or fallback
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1); // Exit the application if the database connection fails
  }
  console.log('MySQL connected...');

  // Create users table if not exists
  const usersTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id CHAR(21) PRIMARY KEY, 
      companyName VARCHAR(255),
      email VARCHAR(255),
      password VARCHAR(255)
    )
  `;
  db.query(usersTableSQL, (err, result) => {
    if (err) throw err;
    console.log('Users table checked/created...');
  });

  // Create all_in_one table with new fields
  const deploymentsTableSQL = `
    CREATE TABLE IF NOT EXISTS all_in_one (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id CHAR(21),
      cloudName VARCHAR(255),
      Ip VARCHAR(15),
      SkylineURL VARCHAR(255),
      CephURL VARCHAR(255),
      deployment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `;
  db.query(deploymentsTableSQL, (err, result) => {
    if (err) throw err;
    console.log('All_in_one table checked/created...');
  });
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/api/saveDeploymentDetails', (req, res) => {
  const { userId, cloudName, ip, skylineUrl, cephUrl, deploymentTime } = req.body;

  // Convert ISO 8601 timestamp to MySQL-compatible format
  const mysqlTimestamp = new Date(deploymentTime).toISOString().slice(0, 19).replace('T', ' ');

  const sql = 'INSERT INTO all_in_one (user_id, cloudName, ip, skylineUrl, cephUrl, deployment_time) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [userId, cloudName, ip, skylineUrl, cephUrl, mysqlTimestamp], (err, result) => {
    if (err) {
      console.error('Error saving deployment details:', err);
      return res.status(500).json({ error: 'Failed to save deployment details' });
    }
    res.status(200).json({ message: 'Deployment details saved successfully' });
  });
});

// Register user endpoint
app.post('/register', async (req, res) => {
  const { companyName, email, password } = req.body;

  try {
    // Dynamically import nanoid with custom alphabet
    const { customAlphabet } = await import('nanoid');
    const nanoid = customAlphabet('ABCDEVSR0123456789abcdefgzkh', 6);
    const id = nanoid(); // Generate unique ID with custom alphabet

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = 'INSERT INTO users (id, companyName, email, password) VALUES (?, ?, ?, ?)';
    await new Promise((resolve, reject) => {
      db.query(sql, [id, companyName, email, hashedPassword], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    // Set the user session after registration
    req.session.userId = id;

    // Send registration email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      cc: ['support@pinakastra.cloud'],
      subject: 'Welcome to Pinakastra!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #002147; padding: 20px; text-align: center;">
            <img src="https://pinakastra.com/assets/images/logo/logo.png" alt="Pinakastra" style="height: 50px;">
          </div>
          <div style="background-color: #f5f5f5; padding: 30px; text-align: center;">
            <h2 style="color: #1f75b6;">Welcome to Pinakastra!</h2>
            <p>Hello <strong>${companyName}</strong>,</p>
            <p>Your account has been successfully registered. Your User ID is:</p>
            <p><strong>${id}</strong></p>
            <p>If you have any questions, feel free to contact us!</p>
          </div>
        </div>
      `
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          console.log('Email sent:', info.response);
          resolve(info);
        }
      });
    });

    res.status(200).json({ message: 'User registered successfully', userId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Endpoint to handle deployment and save details
app.post('/deploy', (req, res) => {
  const { cloudName, Ip, SkylineURL, CephURL, deploymentDetails } = req.body; // Capture additional details
  const userId = req.session.userId;  // The user ID is stored in session after login

  if (!userId) {
    return res.status(403).json({ error: 'User not authenticated' });
  }

  const sql = 'INSERT INTO all_in_one (user_id, cloudName, Ip, SkylineURL, CephURL) VALUES (?, ?, ?, ?, ?, ?)';
  const deploymentData = JSON.stringify(deploymentDetails);  // Convert the deployment details to JSON format
  const currentDate = new Date().toISOString();  // Get current date and time in ISO format

  db.query(sql, [userId, cloudName, Ip, SkylineURL, CephURL, deploymentData], (err, result) => {
    if (err) {
      console.error('Error saving deployment details:', err);
      return res.status(500).json({ error: 'Error saving deployment details' });
    }
    res.status(200).json({ message: 'Deployment successful' });
  });
});

// Endpoint to fetch deployment details for the logged-in user
app.get('/dashboard', (req, res) => {
  const userId = req.session.userId;  // The user ID is stored in session after login

  if (!userId) {
    return res.status(403).json({ error: 'User not authenticated' });
  }

  const sql = 'SELECT * FROM all_in_one WHERE user_id = ? ORDER BY deployment_time DESC';

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error fetching deployment details:', err);
      return res.status(500).json({ error: 'Error fetching deployment details' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'No deployments found' });
    }

    res.status(200).json({ all_in_one: result });
  });
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

