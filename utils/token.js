const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (id, expiresIn = "7d") => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment variables");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

module.exports = { generateToken };
