require('dotenv').config();
const Joi = require('joi');
const express = require('express');
const server = express();
server.use(express.json());

// Start listening for requests
server.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}...`);
});

// Register new users
server.post('/register', (req, res) => {});

// Login existing users
server.post('/login', (req, res) => {});

// Validate request data
