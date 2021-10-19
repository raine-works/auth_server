require('dotenv').config();
const jtw = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const uid = require('uuid').v4;

class User {
  constructor(firstName, lastName, email, password, token) {
    (this.uid = uid()),
      (this.firstName = firstName),
      (this.lastName = lastName),
      (this.email = email),
      (this.password = password);
  }
}

const registerUser = async (user) => {
  try {
  } catch (error) {
    throw error;
  }
};
