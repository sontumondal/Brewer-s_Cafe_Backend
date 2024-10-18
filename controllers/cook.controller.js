const Cook = require("../models/cook.model");
const Order = require("../models/order.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Table=require("../models/table.model")
const MenuItem = require("../models/menuItem.model");

class CookController {
  // Render Register Page
  renderRegister = async (req, res) => {
    try {
      res.render("cook/register", {
        title: "Cook Registration",
      });
    } catch (error) {
      console.log("Cook Register error", error);
    }
  };

  // Render Login Page
  renderLogin = async (req, res) => {
    try {
      res.render("cook/login", {
        title: "Cook Login",
      });
    } catch (error) {
      console.log("Cook login error", error);
    }
  };

  // Register cook
  register = async (req, res) => {
    const { name, email, password } = req.body;

    // Check if cook exists
    const cookExists = await Cook.findOne({ email });
    if (cookExists) {
      return res.status(400).json({ message: "Cook already exists" });
    }

    // Create new cook
    const cook = new Cook({ name, email, password });
    await cook.save();

    // Generate JWT and store in cookies
    const token = this.generateToken(cook._id);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure cookies in production
    sameSite: "strict", // Prevent cross-site request
  });
      res.redirect("/cook/tables");
  };

  // Login cook
  login = async (req, res) => {
    const { email, password } = req.body;
    const cook = await Cook.findOne({ email });

    // Check if cook exists and password is correct
    if (!cook || !bcrypt.compareSync(password, cook.password)) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT and store in cookies
    const token = this.generateToken(cook._id);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure cookies in production
    sameSite: "strict", // Prevent cross-site request
  });    res.redirect("/cook/tables");
  };

  // Logout cook
  logout = (req, res) => {
    res.clearCookie("token"); // Clear the JWT token cookie
    res.redirect("/cook/login"); // Redirect to login page
  };

  // Generate JWT
  generateToken = (cookId) => {
    return jwt.sign({ id: cookId }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
  };

  // Protect Route Middleware
  protect = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect("/cook/login");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.cook = await Cook.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.redirect("/cook/login");
    }
  };

  // Render Dashboard Page
  dashboard = async (req, res) => {
    try {
      res.render("cook/dashboard", {
        title: "Cook Dashboard",
        cook: req.cook,
      });
    } catch (error) {
      console.log("Cook dashboard error", error);
    }
  };

  // Step 1: Render all tables with their statuses
  async renderTables(req, res) {
    try {
      const tables = await Table.find();

      // Count total orders by status
      const totalOrdersCount = await Order.countDocuments(); // Total count of all orders
      const deliveredCount = await Order.countDocuments({
        status: "delivered",
      });
      const pendingCount = await Order.countDocuments({ status: "pending" });
      const preparingCount = await Order.countDocuments({
        status: "preparing",
      });
      const doneCount = await Order.countDocuments({ status: "done" });

      // Render the template with tables and order counts
      res.render("cook/tables", {
        title: "Tables",
        tables,
        totalOrdersCount, // Total order count
        deliveredCount,
        pendingCount,
        preparingCount,
        doneCount,
      });
    } catch (error) {
      console.error("Error fetching tables:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  // Step 2: Render details for a specific table
  async renderTableDetails(req, res) {
    const { tableId } = req.params;
    try {
      // Fetch the table details
      const table = await Table.findById(tableId);
      // Count total orders by status
      const totalOrdersCount = await Order.countDocuments();
      // Fetch orders for the specified table
      const orders = await Order.find({ table: tableId }).populate(
        "menuItems.menuId"
      );

      // Count orders by status
      const deliveredCount = await Order.countDocuments({
        table: tableId,
        status: "delivered",
      });
      const pendingCount = await Order.countDocuments({
        table: tableId,
        status: "pending",
      });
      const preparingCount = await Order.countDocuments({
        table: tableId,
        status: "preparing",
      });
      const doneCount = await Order.countDocuments({
        table: tableId,
        status: "done",
      });

      // Render the template with orders, counts, and table information
      res.render("cook/tableDetails", {
        title: "Table Details",
        tableId,
        tableNumber: table.tableNumber, // Assuming the table model has a 'number' field
        orders,
        totalOrdersCount,
        deliveredCount,
        pendingCount,
        preparingCount,
        doneCount,
      });
    } catch (error) {
      console.error("Error fetching table details:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  // Step 3: Update order status
  async updateOrderStatus(req, res) {
    const { orderId, status } = req.body; // status can be 'pending', 'preparing', or 'done'

    try {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found." });

      order.status = status; // Update order status
      await order.save();

      res.redirect(`/cook/table/${order.table}`); // Redirect back to the table details
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Error updating order status." });
    }
  }

  // Step 4: Render pending orders
  async renderPendingOrders(req, res) {
    try {
      const pendingOrders = await Order.find({ status: "pending" })
        .populate("table") // Populating the table information
        .populate("menuItems.menuId");

      // Fetch all tables
      const tables = await Table.find();

      // Count total orders by status
      const totalOrdersCount = await Order.countDocuments(); // Total count of all orders
      const deliveredCount = await Order.countDocuments({
        status: "delivered",
      });
      const pendingCount = await Order.countDocuments({ status: "pending" });
      const preparingCount = await Order.countDocuments({
        status: "preparing",
      });
      const doneCount = await Order.countDocuments({ status: "done" });

      // Render the template with pending orders, order counts, and tables
      res.render("cook/pendingOrders", {
        title: "Pending Orders",
        pendingOrders,
        tables, // Passing the tables to the template
        totalOrdersCount,
        deliveredCount,
        pendingCount,
        preparingCount,
        doneCount,
      });
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  // Step 5: Render delivered orders
  async renderDeliveredOrders(req, res) {
    try {
      const deliveredOrders = await Order.find({ status: "delivered" })
        .populate("table") // Populating the table information
        .populate("menuItems.menuId");

      // Fetch all tables
      const tables = await Table.find();

      // Count total orders by status
      const totalOrdersCount = await Order.countDocuments(); // Total count of all orders
      const deliveredCount = await Order.countDocuments({
        status: "delivered",
      });
      const pendingCount = await Order.countDocuments({ status: "pending" });
      const preparingCount = await Order.countDocuments({
        status: "preparing",
      });
      const doneCount = await Order.countDocuments({ status: "done" });

      // Render the template with delivered orders, order counts, and tables
      res.render("cook/deliveredOrders", {
        title: "Delivered Orders",
        deliveredOrders,
        tables, // Passing the tables to the template
        totalOrdersCount,
        deliveredCount,
        pendingCount,
        preparingCount,
        doneCount,
      });
    } catch (error) {
      console.error("Error fetching delivered orders:", error);
      res.status(500).send("Internal Server Error");
    }
  }
}

module.exports = new CookController();



//  // all table list
//   async list(req, res) {
//     try {
//       const table = await Table.find();

//       res.render("cook/list", {
//         title: "Cook Table list",
//         table,
//       });
//     } catch (error) {
//       res
//         .status(500)
//         .json({ message: "Error retrieving pending orders.", error });
//     }
//   }
// //  check this have to work 
//   async alllist(req, res) {
//     try {
//       const orders = await Order.find()
//         .populate("table")
//         .populate("menuItems.menuId");
//       res.render("cook/allList", {
//         title: "Cook Table list",
//         orders,
//       });
//     } catch (error) {
//       res
//         .status(500)
//         .json({ message: "Error retrieving pending orders.", error });
//     }
//   }
//   // View pending orders
//   // async viewPendingOrders(req, res) {
//   //   try {
//   //     const orders = await Order.find({ status: "pending" });
//   //     res.render("cook/orders", {
//   //       title: "Cook Pending Orders",
//   //       orders,
//   //     });
//   //   } catch (error) {
//   //     res
//   //       .status(500)
//   //       .json({ message: "Error retrieving pending orders.", error });
//   //   }
//   // }
//   // View pending orders
//   async viewPendingOrders(req, res) {
//     try {
//       const orders = await Order.find({ status: "pending" })
//         .populate("table")
//         .populate("menuItems.menuId");
//       res.render("cook/orders", {
//         title: "Cook Pending Orders",
//         orders,
//       });
//     } catch (error) {
//       res
//         .status(500)
//         .json({ message: "Error retrieving pending orders.", error });
//     }
//   }

//   // Confirm order
//   async confirmOrder(req, res) {
//     const { orderId } = req.body;

//     try {
//       const order = await Order.findById(orderId);
//       if (!order) {
//         return res.status(404).json({ message: "Order not found." });
//       }

//       order.status = "confirmed";
//       await order.save();

//       res.redirect("/cook/orders");
//     } catch (error) {
//       res.status(500).json({ message: "Error confirming order.", error });
//     }
//   }

//   // Render Confirm Order Page
//   // async renderConfirmOrder(req, res) {
//   //   const { orderId } = req.params;

//   //   try {
//   //     const order = await Order.findById(orderId);
//   //     if (!order) {
//   //       return res.status(404).json({ message: "Order not found." });
//   //     }

//   //     res.render("cook/confirm", {
//   //       title: "Confirm Order",
//   //       order,
//   //     });
//   //   } catch (error) {
//   //     console.log("Error rendering confirm order page", error);
//   //     res
//   //       .status(500)
//   //       .json({ message: "Error rendering confirm order page.", error });
//   //   }
//   // }

//   // async renderConfirmOrder(req, res) {
//   //   const { orderId } = req.params;

//   //   // Check if orderId is a valid ObjectId
//   //   if (!mongoose.Types.ObjectId.isValid(orderId)) {
//   //     return res.status(400).json({ message: "Invalid order ID format." });
//   //   }

//   //   try {
//   //     const order = await Order.findById(orderId);
//   //     if (!order) {
//   //       return res.status(404).json({ message: "Order not found." });
//   //     }

//   //     res.render("cook/confirmOrder", {
//   //       title: "Confirm Order",
//   //       order,
//   //     });
//   //   } catch (error) {
//   //     console.log("Error rendering confirm order page", error);
//   //     res
//   //       .status(500)
//   //       .json({ message: "Error rendering confirm order page.", error });
//   //   }
//   // }
//   async renderConfirmOrder(req, res) {
//     const { orderId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(orderId)) {
//       return res.status(400).json({ message: "Invalid order ID format." });
//     }

//     try {
//       const order = await Order.findById(orderId)
//         .populate("table")
//         .populate("menuItems.menuId");
//       if (!order) {
//         return res.status(404).json({ message: "Order not found." });
//       }

//       res.render("cook/confirmOrder", {
//         title: "Confirm Order",
//         order,
//       });
//     } catch (error) {
//       console.log("Error rendering confirm order page", error);
//       res
//         .status(500)
//         .json({ message: "Error rendering confirm order page.", error });
//     }
//   }

//   // List orders assigned to the cook
//   async listOrders(req, res) {
//     try {
//       const orders = await Order.find({
//         cook: req.cookId,
//         status: { $in: ["pending", "preparing"] },
//       });
//       res.render("cook/orders", {
//         title: "Cook Orders",
//         orders,
//       });
//     } catch (error) {
//       res.status(500).send("Error fetching orders");
//     }
//   }

//   // Update the status of an order
//   // async updateOrderStatus(req, res) {
//   //   const { orderId, status } = req.body;
//   //   try {
//   //     const order = await Order.findById(orderId);
//   //     if (!order) {
//   //       return res.status(404).send("Order not found");
//   //     }

//   //     order.status = status; // "preparing", "ready", etc.
//   //     await order.save();
//   //     res.redirect("/cook/orders");
//   //   } catch (error) {
//   //     res.status(500).send("Error updating order status");
//   //   }
//   // }

//   async updateOrderStatus(req, res) {
//     const { orderId, status } = req.body;
//     try {
//       const order = await Order.findById(orderId);
//       if (!order) {
//         return res.status(404).send("Order not found");
//       }

//       order.status = status;
//       await order.save();
//       res.redirect("/cook/orders");
//     } catch (error) {
//       res.status(500).send("Error updating order status");
//     }
//   }