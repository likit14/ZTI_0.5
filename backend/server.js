const express = require("express");
const session = require("express-session");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const authRoutes = require("./authRoutes"); // Adjust the path as needed
const cors = require("cors");
const loginRoutes = require("./loginRoutes"); // New file for login
const nodemailer = require("nodemailer"); // Import nodemailer library
const bcrypt = require("bcrypt"); // Import bcrypt library
require("dotenv").config(); // Load environment variables

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", loginRoutes); // Use the login routes
app.use("/api", authRoutes);

// Use session middleware (if you are using sessions for authentication)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key", // Use environment variable or fallback
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true in production with HTTPS
  })
);

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1); // Exit the application if the database connection fails
  }
  console.log("MySQL connected...");

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
    console.log("Users table checked/created...");
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
      FOREIGN KEY (user_id) REFERENCES users(id),
      bmc_ip VARCHAR(15),           
      bmc_username VARCHAR(255),   
      bmc_password VARCHAR(255) 
    )
  `;
  db.query(deploymentsTableSQL, (err, result) => {
    if (err) throw err;
    console.log("All_in_one table checked/created...");
  });
});

// Create hardware_info table if not exists
const hardwareInfoTableSQL = `
  CREATE TABLE IF NOT EXISTS hardware_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(21),
    server_ip VARCHAR(15),
    cpu_cores INT,
    memory VARCHAR(50), -- e.g., '16GB', '32GB'
    disk VARCHAR(255), -- e.g., '500GB SSD, 1TB HDD'
    nic_1g INT, -- Number of 1G NICs
    nic_10g INT, -- Number of 10G NICs
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`;

db.query(hardwareInfoTableSQL, (err, result) => {
  if (err) throw err;
  console.log("Hardware_info table checked/created...");
});


// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/api/saveDeploymentDetails", (req, res) => {
  const {
    userId,
    cloudName,
    ip,
    skylineUrl,
    cephUrl,
    deploymentTime,
    bmcDetails,
  } = req.body;

  console.log("Received deployment details:", req.body);

  // Convert ISO 8601 timestamp to MySQL-compatible format
  const mysqlTimestamp = new Date(deploymentTime)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  // Handle missing bmcDetails gracefully
  const bmcIp = bmcDetails ? bmcDetails.ip : null;
  const bmcUsername = bmcDetails ? bmcDetails.username : null;
  const bmcPassword = bmcDetails ? bmcDetails.password : null;

  console.log("Prepared SQL parameters:", [
    userId,
    cloudName,
    ip,
    skylineUrl,
    cephUrl,
    mysqlTimestamp,
    bmcIp,
    bmcUsername,
    bmcPassword,
  ]);

  const sql = `
    INSERT INTO all_in_one (
      user_id, 
      cloudName, 
      ip, 
      skylineUrl, 
      cephUrl, 
      deployment_time, 
      bmc_ip, 
      bmc_username, 
      bmc_password
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      userId,
      cloudName,
      ip,
      skylineUrl,
      cephUrl,
      mysqlTimestamp,
      bmcIp,
      bmcUsername,
      bmcPassword,
    ],
    (err, result) => {
      if (err) {
        console.error("Error saving deployment details:", err);
        return res.status(500).json({
          error: "Failed to save deployment details",
          details: err.message,
        });
      }

      console.log("Deployment details saved successfully:", result);
      res.status(200).json({ message: "Deployment details saved successfully" });
    }
  );
});

app.post("/api/saveHardwareInfo", (req, res) => {
  const { userId, serverIp, cpuCores, memory, disk, nic1g, nic10g } = req.body;

  const sql = `
    INSERT INTO hardware_info (
      user_id, 
      server_ip, 
      cpu_cores, 
      memory, 
      disk, 
      nic_1g, 
      nic_10g
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [userId, serverIp, cpuCores, memory, disk, nic1g, nic10g],
    (err, result) => {
      if (err) {
        console.error("Error saving hardware info:", err);
        return res.status(500).json({
          error: "Failed to save hardware info",
          details: err.message,
        });
      }

      console.log("Hardware info saved successfully:", result);
      res.status(200).json({ message: "Hardware info saved successfully" });
    }
  );
});

// Register user endpoint
app.post("/register", async (req, res) => {
  const { companyName, email, password } = req.body;

  try {
    // Dynamically import nanoid with custom alphabet
    const { customAlphabet } = await import("nanoid");
    const nanoid = customAlphabet("ABCDEVSR0123456789abcdefgzkh", 6);
    const id = nanoid(); // Generate unique ID with custom alphabet

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql =
      "INSERT INTO users (id, companyName, email, password) VALUES (?, ?, ?, ?)";
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
      cc: ["support@pinakastra.cloud"],
      subject: "Welcome to Pinakastra!",
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
      `,
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          console.log("Email sent:", info.response);
          resolve(info);
        }
      });
    });

    res
      .status(200)
      .json({ message: "User registered successfully", userId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error registering user" });
  }
});

const PORT = 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);

