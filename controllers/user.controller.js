const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const twilio = require("twilio");
const User = require("../models/user.model");
const Order = require("../models/order.model");
const Table = require("../models/table.model");
const Menu = require("../models/menuItem.model");
require("dotenv").config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

class UserController {
  // Helper function to generate JWT
  generateToken(userId, expiresIn = "30d") {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });
  }

  // User registration
  registerUser = async (req, res) => {
    const { first_name, last_name, email, phone_no } = req.body;
    const profilePicture = req.file
      ? `/uploads/${req.file.filename}`
      : undefined;

    if (!first_name || !last_name || !email || !phone_no) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const userExists = await User.findOne({ $or: [{ email }, { phone_no }] });
    if (userExists) {
      return res.status(409).json({
        message: "User with this email or phone number already exists!",
      });
    }

    const user = await User.create({
      first_name,
      last_name,
      email,
      phone_no,
      profilePicture,
    });

    const token = this.generateToken(user._id);
    res.status(201).json({
      status: 201,
      data: { user, token },
      message: "User registered successfully",
    });
  };

  // Send OTP
  sendOtp = async (req, res) => {
    const { phone_no } = req.body;

    if (!phone_no) {
      return res.status(400).json({ message: "Phone number is required!" });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    const user = await User.findOneAndUpdate(
      { phone_no },
      { otp, otp_expiry: Date.now() + 10 * 60 * 1000 }, // OTP valid for 10 minutes
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone_no,
    });

    res.status(200).json({
      status: 200,
      data: { phone_no },
      message: "OTP sent successfully",
    });
  };

  // User login
  loginUser = async (req, res) => {
    const { phone_no, otp } = req.body;

    if (!phone_no || !otp) {
      return res
        .status(400)
        .json({ message: "Phone number and OTP are required!" });
    }

    const user = await User.findOne({ phone_no });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (Date.now() > user.otp_expiry) {
      return res
        .status(401)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    if (user.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP!" });
    }

    user.otp = undefined;
    user.otp_expiry = undefined;
    await user.save();

    const token = this.generateToken(user._id);
    res.status(200).json({
      status: 200,
      data: { user, token },
      message: "Login successful",
    });
  };

  // Book a table
  async bookTable(req, res) {
    const { tableNumber, selectedMenus, menuCount } = req.body;

    try {
      const table = await Table.findOne({ tableNumber });
      if (!table || table.isBooked) {
        return res.status(400).json({ message: "Table not available." });
      }

      const menuItems = await Menu.find({ _id: { $in: selectedMenus } });
      if (menuItems.length !== selectedMenus.length) {
        return res.status(404).json({ message: "Some menu items not found." });
      }

      table.isBooked = true;
      await table.save();

      const order = new Order({
        userId: req.user.id,
        tableNumber,
        menuItems: selectedMenus,
        menuCount,
        status: "pending",
      });
      await order.save();

      res.status(200).json({ message: "Table booked successfully!", order });
    } catch (error) {
      res.status(500).json({ message: "Error booking table.", error });
    }
  }

  // View user orders
  async viewOrders(req, res) {
    try {
      const orders = await Order.find({ userId: req.user.id });
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving orders.", error });
    }
  }
}

module.exports = new UserController();
