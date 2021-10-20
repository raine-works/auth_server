require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const uid = require('uuid').v4;
const { DateTime } = require("luxon");
const db = require('../database/users.json');

// Hash users password for safe keeping
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
}

class User {
  constructor(firstName, lastName, email, password, ipAddress) {
    this.uid = uid(),
    this.firstName = firstName,
    this.lastName = lastName,
    this.email = email.toLowerCase(),
    this.password = password, 
    this.token = null, 
    this.createdDate = DateTime.utc(), 
    this.lastLogin = DateTime.utc(), 
    this.lastLoginIpAdress = ipAddress
  }
}

// Register a new user
exports.registerUser = async (event, metadata) => {
  try {

    const { firstName, lastName, email, password } = event;
    const { ipAddress } = metadata;
    const encryptedPassword = await hashPassword(password);

    // Look for existing user with the same email in the database
    const existingUser = db.users.find(u => u.email === email.toLowerCase());
    if (existingUser) {

      // return response if there is already a user in the database with this email
      return {
        status: 400, 
        data: `${event.email.toLowerCase()} has already been registered.`
      }

    } else {

      // Create user record in database
      const newUser = await new User(firstName, lastName, email, encryptedPassword, ipAddress);

      // Generate new token
      const token = jwt.sign(
        { uid: newUser.uid, email: newUser.email }, 
        process.env.TOKEN_KEY, 
        { expiresIn: '2' }
      )

      // Save new token to user record
      newUser.token = token;

      // Add new user record to the database
      db.users.push(newUser);

      // return new user record with a valid token
      return {
        status: 200, 
        data: {
          firstName: newUser.firstName, 
          lastName: newUser.lastName, 
          email: newUser.email, 
          uid: newUser.uid, 
          createdDate: newUser.createdDate, 
          lastLogin: newUser.lastLogin, 
          token: newUser.token
        }
      }

    }
  } catch (error) {

    // Throw error if something breaks
    throw error;

  }
};

// Verify existing user and authenticate them
exports.loginUser = async (event, metadata) => {
  try {

    const { email, password } = event;
    const { ipAddress } = metadata;

    // Find existing user in database by email
    const existingUser = db.users.find(u => u.email === email.toLowerCase());

    // If user exists move to the authentication step
    if (existingUser) {

      // Verify users password and create new token
      if (await bcrypt.compare(password, existingUser.password)) {
        const token = jwt.sign(
          { uid: existingUser.uid, email: existingUser.email }, 
          process.env.TOKEN_KEY, 
          { expiresIn: '2h' }
        )

        existingUser.token = token;
        existingUser.lastLogin = DateTime.utc();
        existingUser.lastLoginIpAdress = ipAddress;
        return {
          status: 200, 
          data: {
            firstName: existingUser.firstName, 
            lastName: existingUser.lastName, 
            email: existingUser.email, 
            uid: existingUser.uid, 
            createdDate: existingUser.createdDate, 
            lastLogin: existingUser.lastLogin, 
            token: existingUser.token
          }
        }

      // return invalid password message if password does not match
      } else {
        return {
          status: 400, 
          data: 'Invalid password'
        }
      }
    
    // return no user found message 
    } else {
      return {
        status: 400, 
        data: `${email} has not yet been registered.`
      } 
    }

  } catch (error) {

    // Throw error if something breaks
    throw error;

  }
}