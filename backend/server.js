const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer'); // Import nodemailer library
const bcrypt = require('bcrypt'); // Import bcrypt library
require('dotenv').config(); // Load environment variables
const cors = require('cors');  // Import cors package


const app = express();

app.use(cors({
  origin: '*',  // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
});

// Create users table if not exists
const createUserTable = `
  CREATE TABLE IF NOT EXISTS users (
    id CHAR(21) PRIMARY KEY, 
    companyName VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255)
  )
`;

db.query(createUserTable, (err, result) => {
  if (err) throw err;
  console.log('Users table checked/created...');
});

// Create single-node table if not exists
const createSingleNodeTable = `
  CREATE TABLE IF NOT EXISTS single_node (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
  cloudName VARCHAR(255)
  )
`;

db.query(createSingleNodeTable, (err, result) => {
  if (err) throw err;
  console.log('Single-node table checked/created...');
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
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

    // Send registration email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      cc: ['support@pinakastra.cloud'],
      subject: 'Welcome to Pinakastra!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <!-- Banner/Header -->
          <div style="background-color: #002147; padding: 20px; text-align: center;">
            <img src="https://pinakastra.com/assets/images/logo/logo.png" alt="Pinakastra" style="height: 50px;">
          </div>
          
          <!-- Main Content -->
          <div style="background-color: #f5f5f5; padding: 30px; text-align: center;">
            <h2 style="color: #1f75b6;">Welcome to Pinakastra!</h2>
            <p style="font-size: 16px; color: #333;">
              Hello <strong>${companyName}</strong>,
            </p>
            <p style="font-size: 16px; color: #333;">
              Thank you for joining us! Your account has been successfully registered.
            </p>
            <div style="background-color: #ffffff; border-radius: 10px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <p style="font-size: 14px; color: #555; margin: 0;">
                <strong>Your User ID :</strong>
              </p>
              <p style="font-size: 16px; color: #333; margin: 10px 0;">
              </p>
              <p style="font-size: 24px; color: #1f75b6; font-weight: bold; margin: 0;">
                ${id}
              </p>
            </div>
            <p style="font-size: 14px; color: #555;">
              Please keep this information secure.
            </p>
            <p style="font-size: 14px; color: #555;">
              If you have any questions or need assistance, feel free to contact our support team.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #002147; padding: 10px; text-align: center; color: #fff;">
            <p style="margin: 0;">Pinakastra Cloud </p>
            <p style="margin: 0;">
              <a href="mailto:cloud@pinakastra.com" style="color: #ffeb3b; text-decoration: none;">support@pinakastra.cloud</a>
            </p>
            <div style="margin-top: 10px;">
              <a href="https://www.facebook.com/profile.php?id=61552535922993&mibextid=kFxxJD" style="margin: 0 5px; color: #fff; text-decoration: none;">Facebook</a>
              <a href="https://x.com/pinakastra" style="margin: 0 5px; color: #fff; text-decoration: none;">X</a>
              <a href="https://linkedin.com/company/pinakastra-computing" style="margin: 0 5px; color: #fff; text-decoration: none;">LinkedIn</a>
            </div>
            <p style="margin-top: 10px; font-size: 12px;">&copy; Copyright  2021, All Right Reserved Pinakastra</p>
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

// Endpoint to store cloud deployment details (cloud name)
app.post('/api/storedeploydetails', async (req, res) => {
  const { cloudName } = req.body;

  if (!cloudName) {
    return res.status(400).json({ message: 'Cloud name is required' });
  }

  // Insert the cloud name into the `single_node` table
  const sql = ' INSERT INTO single_node (cloudName) VALUES (?)';

  try {
    await new Promise((resolve, reject) => {
      db.query(sql, [cloudName], (err, result) => {
        if (err) {
          reject(err); // Reject if there is an error
        } else {
          console.log('Cloud name inserted:', cloudName); // Log to confirm insertion
          resolve(result); // Resolve on success
        }
      });
    });

    res.status(200).json({ message: 'Cloud name stored successfully', cloudName });
  } catch (error) {
    console.error('Error storing cloud name:', error);
    res.status(500).json({ error: 'Error storing cloud name' });
  }
});


const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
