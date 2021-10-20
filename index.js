require('dotenv').config();
const Joi = require('joi');
const express = require('express');
const server = express();
const auth = require('./auth/index');
server.use(express.json());

// Start listening for requests
server.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}...`);
});

// Register new users
server.post('/register', async (req, res) => {
  try {
    const validRequest = await newUser.validate(req.body);
    if (!validRequest.error) {
      const response = await auth.registerUser(validRequest.value, { ipAddress: req.ip });
      res.status(response.status).json({
        success: response.status === 200 ? true : false, 
        data: response.data
      })
    } else {
      res.status(400).json({
        success: false, 
        error: {
          message: 'Validation error', 
          context: validRequest.error.details
        }
      })
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false, 
      error: {
        message: 'Internal server error', 
        context: error.message
      }
    })
  }
});

// Login existing users
server.post('/login', async (req, res) => {
  try {
    const validRequest = await existingUser.validate(req.body);
    if (!validRequest.error) {
      const response = await auth.loginUser(validRequest.value, { ipAddress: req.ip });
      res.status(response.status).json({
        success: response.status === 200 ? true : false, 
        data: response.data
      })
    } else {
      res.status(400).json({
        success: false, 
        error: {
          message: 'Validation error', 
          context: validRequest.error.details
        }
      })
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false, 
      error: {
        message: 'Internal server error', 
        context: error.message
      }
    })
  }
});

// Validate request data 
// (new user schema)
const newUser = Joi.object({
  firstName: Joi.string().required(), 
  lastName: Joi.string().required(), 
  email: Joi.string().email().required(), 
  password: Joi.string().required()
})

// (existing user schema)
const existingUser = Joi.object({
  email: Joi.string().email().required(), 
  password: Joi.string().required()
})