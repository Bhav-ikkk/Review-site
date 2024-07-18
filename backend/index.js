const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const collection = require("./config");

const app = express();

// Convert data into JSON format
app.use(express.json());

// Static file serving
app.use(express.static(path.join(__dirname, "src")));

// To parse URL-encoded data
app.use(express.urlencoded({ extended: false }));

// Routes to serve HTML pages
app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "login", "login.html")
  );
});

app.get("/signin", (req, res) => {
  res.sendFile(path.join(__dirname, "login", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "login", "login.html"));
});

// Register User
app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };

  // Check if the username already exists in the database
  const existingUser = await collection.findOne({ name: data.name });

  if (existingUser) {
    res.send("User already exists. Please choose a different username.");
  } else {
    // Hash the password using bcrypt
    const saltRounds = 10; // Number of salt rounds for bcrypt
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    data.password = hashedPassword; // Replace the original password with the hashed one

    const userdata = await collection.insertMany(data);
    console.log(userdata);
    res.send("User registered successfully!");
  }
});

// Login user
app.post("/signin", async (req, res) => {
  try {
    const check = await collection.findOne({ name: req.body.username });
    if (!check) {
      res.send("Username not found");
    } else {
      // Compare the hashed password from the database with the plaintext password
      const isPasswordMatch = await bcrypt.compare(
        req.body.password,
        check.password
      );
      if (!isPasswordMatch) {
        res.send("Wrong Password");
      } else {
        res.send("Login successful!");
      }
    }
  } catch (error) {
    console.error(error);
    res.send("Wrong Details");
  }
});

// Define Port for Application
const port = 3050;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
