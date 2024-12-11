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
const Agenda = require('agenda');

const app = express();

const mongoConnectionString = 'mongodb://192.168.249.100:27017/agenda_jobs';
const agenda = new Agenda({ db: { address: mongoConnectionString } });

agenda.on('ready', () => {
  console.log('Agenda connected to MongoDB');
});



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


// Create a MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
});

// Connect to the MySQL database
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
    ) ENGINE=InnoDB;  -- Ensure InnoDB engine for foreign key support
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
    ) ENGINE=InnoDB;  -- Ensure InnoDB engine for foreign key support
  `;
  db.query(deploymentsTableSQL, (err, result) => {
    if (err) throw err;
    console.log("All_in_one table checked/created...");
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
    ) ENGINE=InnoDB;  -- Ensure InnoDB engine for foreign key support
  `;

  db.query(hardwareInfoTableSQL, (err, result) => {
    if (err) throw err;
    console.log("Hardware_info table checked/created...");
  });
});


// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//Save Deployment API 
app.post("/api/saveDeploymentDetails", async (req, res) => {
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

  try {
    // Add the job to the Agenda queue
    await agenda.now("saveDeploymentDetails", {
      userId,
      cloudName,
      ip,
      skylineUrl,
      cephUrl,
      deploymentTime,
      bmcDetails,
    });

    res.status(200).json({
      message: "Deployment details job queued successfully. It will be processed shortly.",
    });
  } catch (error) {
    console.error("Error queuing deployment details job:", error);
    res.status(500).json({
      error: "Failed to queue deployment details job",
      details: error.message,
    });
  }
});


//Agenda Save Deployment Job
agenda.define("saveDeploymentDetails", async (job) => {
  const {
    userId,
    cloudName,
    ip,
    skylineUrl,
    cephUrl,
    deploymentTime,
    bmcDetails,
  } = job.attrs.data;

  // Convert ISO 8601 timestamp to MySQL-compatible format
  const mysqlTimestamp = new Date(deploymentTime)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  const bmcIp = bmcDetails ? bmcDetails.ip : null;
  const bmcUsername = bmcDetails ? bmcDetails.username : null;
  const bmcPassword = bmcDetails ? bmcDetails.password : null;

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

  // Save details to the database
  return new Promise((resolve, reject) => {
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
          return reject(err);
        }
        console.log("Deployment details saved successfully:", result);
        resolve(result);
      }
    );
  });
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

// API to fetch deployment data from the `all_in_one` table
app.get('/api/allinone', (req, res) => {
  const userID = req.query.userID; // Extract userID from query parameters

  if (!userID) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const query = 'SELECT * FROM all_in_one WHERE user_id = ?'; // Adjust your query to filter by userID
  db.query(query, [userID], (err, results) => {
    if (err) {
      console.error('Error fetching All-in-One data:', err);
      return res.status(500).json({ error: 'Failed to fetch All-in-One data' });
    }

    console.log('Fetched data:', results); // Log the results for debugging
    res.json(results);
  });
});

// API route for checking cloud name
app.post('/check-cloud-name', async (req, res) => {
  const { cloudName } = req.body;

  try {
    const result = await agenda.now('checkCloudName', { cloudName });
    res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to queue check cloud name job', details: error.message });
  }
});

// Queue for checking cloud name
agenda.define('checkCloudName', async (job) => {
  const { cloudName } = job.attrs.data;

  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM all_in_one WHERE cloudName = ?';
    db.query(query, [cloudName], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result.length > 0 ? 'Cloud name exists' : 'Cloud name available');
    });
  });
});

// API to fetch bmc data from the `all_in_one` table
app.post("/api/get-power-details", (req, res) => {
  const { userID } = req.body;

  if (!userID) {
    return res.status(400).json({ error: "Missing userID" });
  }

  // Query to fetch data
  const query = "SELECT bmc_ip AS ip, bmc_username AS username, bmc_password AS password, cloudName FROM all_in_one WHERE user_id = ?";
  db.query(query, [userID], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "No data found for the given userID" });
    }

    // Return all matching records
    res.json(results);  // Return the entire results array
  });
});



app.post("/register", async (req, res) => {
  const { companyName, email, password } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await new Promise((resolve, reject) => {
      const checkEmailSql = "SELECT * FROM users WHERE email = ?";
      db.query(checkEmailSql, [email], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already exists !" });
    }

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

agenda.start().then(() => {
  console.log('Agenda started processing jobs');
});

const PORT = 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);

