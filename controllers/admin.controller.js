
const Admin = require("../models/admin.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Order = require("../models/order.model");
const Table = require("../models/table.model");
const User = require("../models/user.model");
class AuthController {
  // Render Register Page
  renderRegister = async (req, res) => {
    try {
      res.render("admin/register", {
        title: "Admin Registration",
      });
    } catch (error) {
      console.log("Admin Register error", error);
    }
  };

  // Render Login Page
  renderLogin = async (req, res) => {
    try {
      res.render("admin/login", {
        title: "Admin Login",
      });
    } catch (error) {
      console.log("Admin login error", error);
    }
  };

  // Register Admin
  register = async (req, res) => {
    const { name, email, password } = req.body;

    // Check if admin exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      req.flash("error_msg", "Admin already exists");
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Create new admin
    const admin = new Admin({ name, email, password });
    await admin.save();
   
    // Generate JWT and store in cookies
    const token = this.generateToken(admin._id);
    res.cookie("token", token, { httpOnly: true });
     req.flash("success_msg", "Admin registered successfully");
    res.redirect("/api/menu-items");
  };

  // Login Admin
  login = async (req, res) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    // Check if admin exists and password is correct
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
            req.flash("error_msg", "Invalid email or password");

      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT and store in cookies
    const token = this.generateToken(admin._id);
    res.cookie("token", token, { httpOnly: true });
         req.flash("success_msg", "Admin login successfully");

    res.redirect("/api/menu-items");
  };

  // Logout Admin
  logout = (req, res) => {
    res.clearCookie("token"); // Clear the JWT token cookie
    res.redirect("/login"); // Redirect to login page
         req.flash("success_msg", "Admin logout successfully");

  };

  // Generate JWT
  generateToken = (adminId) => {
    return jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
  };

  // Protect Route Middleware
  protect = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect("/login");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = await Admin.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.redirect("/login");
    }
  };

  // Render Dashboard Page
  dashboard = async (req, res) => {
    try {
      res.render("admin/dashboard", {
        title: "Admin Dashboard",
        admin: req.admin,
      });
    } catch (error) {
      console.log("Admin dashboard error", error);
    }
  };

  // View all orders
  async viewOrders(req, res) {
    try {
      const orders = await Order.find().populate("userId tableNumber");
      res.render("admin/orders", {
        title:"Admin Order Management",
        orders });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving orders.", error });
    }
  }

  // Update order status
  async updateOrderStatus(req, res) {
    const { orderId, status } = req.body;

    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found." });
      }

      order.status = status;
      await order.save();

      res.redirect("/admin/orders");
    } catch (error) {
      res.status(500).json({ message: "Error updating order status.", error });
    }
  }
}

module.exports = new AuthController();
