const Table = require("../models/table.model");
const jwt = require("jsonwebtoken");
const Menu = require("../models/menuItem.model");
const Order = require("../models/order.model");

class TableBookingController {
  // Middleware to verify JWT token for API calls
  verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(403)
        .json({ message: "Access denied. No token provided." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach decoded user data to the request object
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token." });
    }
  }

  // Get available tables (API and EJS)
  getAvailableTables = async (req, res) => {
    try {
      const tables = await Table.find();

      // If it's an API call
      if (req.headers.accept.includes("application/json")) {
        return res.status(200).json({
          success: true,
          message: "table fetch successfully",
          tables,
        });
      }

      // Render EJS view for admin panel
      res.render("admin/table", {
        title: "",
        tables,
      });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving tables.", error });
    }
  };
  bookTable = async (req, res) => {
    const { tableNumber, selectedMenus, menuCount } = req.body;

    console.log("Request body:", req.body);
    console.log("Table numbers being queried:", tableNumber);

    try {
      // Check if tableNumber is an array and fetch all tables
      const tables = await Table.find({ tableNumber: { $in: tableNumber } });

      if (tables.length === 0) {
        return res.status(400).json({ message: "No tables found." });
      }

      for (const table of tables) {
        console.log(`Table status for ${table.tableNumber}:`, table.status);

        if (table.status !== "available") {
          return res
            .status(400)
            .json({ message: `Table ${table.tableNumber} not available.` });
        }

        // Update each table's status to booked
        table.status = "booked";
        await table.save();
      }

      // Create a new order
      const order = new Order({
        userId: req.user.id,
        tableNumber: tableNumber,
        menuItems: selectedMenus,
        menuCount,
        status: "pending",
      });
      await order.save();

      res.status(200).json({ message: "Tables booked successfully!", order });
    } catch (error) {
      console.error("Error booking table:", error);
      res.status(500).json({ message: "Error booking table.", error });
    }
  };

  // bookTable = async (req, res) => {
  //   const { tableNumber, selectedMenus, menuCount } = req.body;

  //   console.log("Request body:", req.body); // Log the entire request body
  //   console.log("Table number being queried:", tableNumber); // Log the table number

  //   try {
  //     const table = await Table.findOne({ tableNumber });
  //     console.log("Fetched table:", table); // Log the fetched table

  //     if (!table) {
  //       return res.status(400).json({ message: "Table not found." });
  //     }

  //     console.log(`Table status for ${tableNumber}:`, table.status); // Log the status

  //     if (table.status !== "available") {
  //       return res.status(400).json({ message: "Table not available." });
  //     }

  //     // Validate selected menu items
  //     const menuItems = await Menu.find({ _id: { $in: selectedMenus } });
  //     if (menuItems.length !== selectedMenus.length) {
  //       return res.status(404).json({ message: "Some menu items not found." });
  //     }

  //     // Update table status to booked
  //     table.status = "booked";
  //     await table.save();

  //     // Create a new order
  //     const order = new Order({
  //       userId: req.user.id,
  //       tableNumber,
  //       menuItems: selectedMenus,
  //       menuCount,
  //       status: "pending",
  //     });
  //     await order.save();

  //     res.status(200).json({ message: "Table booked successfully!", order });
  //   } catch (error) {
  //     console.error("Error booking table:", error);
  //     res.status(500).json({ message: "Error booking table.", error });
  //   }
  // };

  // Get order details for a user
  viewOrderDetails = async (req, res) => {
    try {
      const orders = await Order.find({ userId: req.user.id }).populate(
        "menuItems"
      );

      if (req.headers.accept.includes("application/json")) {
        return res.status(200).json({ success: true, orders });
      }

      // Render EJS view for user's order details
      // res.render("user/orderDetails", {
      //   title: "Your Order Details",
      //   orders,
      // });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error retrieving order details.", error });
    }
  };

  // Place an order (API only)

  placeOrder = async (req, res) => {
    const { tableNumber, selectedMenus, menuCount } = req.body;

    try {
      const order = new Order({
        userId: req.user.id,
        tableNumber,
        menuItems: selectedMenus,
        menuCount,
        status: "pending",
      });
      await order.save();

      res.status(200).json({ message: "Order placed successfully!", order });
    } catch (error) {
      res.status(500).json({ message: "Error placing order.", error });
    }
  };

  // Update order status (API and EJS)
  updateOrderStatus = async (req, res) => {
    const { orderId, status } = req.body;

    try {
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found." });
      }

      order.status = status;
      await order.save();

      // If it's an API call
      if (req.headers["content-type"] === "application/json") {
        return res
          .status(200)
          .json({ message: "Order status updated!", order });
      }

      // Render the order list for admin (EJS)
      res.redirect("/admin/orders"); // Assuming there's an EJS view to list orders
    } catch (error) {
      res.status(500).json({ message: "Error updating order status.", error });
    }
  };

  // Process payment (API only)
  processPayment = async (req, res) => {
    const { orderId, paymentDetails } = req.body;

    try {
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found." });
      }

      order.status = "paid";
      await order.save();

      res.status(200).json({ message: "Payment successful!", order });
    } catch (error) {
      res.status(500).json({ message: "Error processing payment.", error });
    }
  };

  // Admin panel view for orders (EJS)
  getOrdersForAdmin = async (req, res) => {
    try {
      const orders = await Order.find().populate("menuItems");
      res.render("admin/orders", {
        title: "Order Management",
        orders,
      });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving orders.", error });
    }
  };
}

module.exports = new TableBookingController();

// const Table = require("../models/table.model");
// const jwt = require("jsonwebtoken");
// const Menu = require("../models/menuItem.model");
// const Order = require("../models/order.model");

// class TableBookingController {
//   // Middleware to verify JWT token
//   verifyToken(req, res, next) {
//     const token = req.headers.authorization?.split(" ")[1];

//     if (!token) {
//       return res
//         .status(403)
//         .json({ message: "Access denied. No token provided." });
//     }

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = decoded; // Attach decoded user data to the request object
//       next();
//     } catch (error) {
//       res.status(401).json({ message: "Invalid token." });
//     }
//   }

//   // Get available tables
//   getAvailableTables = async (req, res) => {
//     try {
//       const tables = await Table.find({ isBooked: false });
//       res.status(200).json(tables);
//     } catch (error) {
//       res.status(500).json({ message: "Error retrieving tables.", error });
//     }
//   };

//   // Book a table
//   bookTable = async (req, res) => {
//     const { tableNumber, selectedMenus, menuCount } = req.body;

//     try {
//       // Check if table is available
//       const table = await Table.findOne({ tableNumber });

//       if (!table || table.isBooked) {
//         return res.status(400).json({ message: "Table not available." });
//       }

//       // Check menu availability
//       const menuItems = await Menu.find({ _id: { $in: selectedMenus } });
//       if (menuItems.length !== selectedMenus.length) {
//         return res.status(404).json({ message: "Some menu items not found." });
//       }

//       // Book the table
//       table.isBooked = true;
//       await table.save();

//       // Create order with selected menus and user
//       const order = new Order({
//         userId: req.user.id, // From JWT
//         tableNumber,
//         menuItems: selectedMenus,
//         menuCount,
//         status: "pending",
//       });
//       await order.save();

//       res.status(200).json({ message: "Table booked successfully!", order });
//     } catch (error) {
//       res.status(500).json({ message: "Error booking table.", error });
//     }
//   };

//   // User can place an order after booking a table
//   placeOrder = async (req, res) => {
//     const { tableNumber, selectedMenus, menuCount } = req.body;

//     try {
//       const order = new Order({
//         userId: req.user.id, // From JWT
//         tableNumber,
//         menuItems: selectedMenus,
//         menuCount,
//         status: "pending",
//       });
//       await order.save();

//       res.status(200).json({ message: "Order placed successfully!", order });
//     } catch (error) {
//       res.status(500).json({ message: "Error placing order.", error });
//     }
//   };

//   // Update order status (waiter/cook updates it)
//   updateOrderStatus = async (req, res) => {
//     const { orderId, status } = req.body; // pending, confirmed, delivered

//     try {
//       const order = await Order.findById(orderId);

//       if (!order) {
//         return res.status(404).json({ message: "Order not found." });
//       }

//       order.status = status;
//       await order.save();

//       res.status(200).json({ message: "Order status updated!", order });
//     } catch (error) {
//       res.status(500).json({ message: "Error updating order status.", error });
//     }
//   };

//   // Payment processing
//   processPayment = async (req, res) => {
//     const { orderId, paymentDetails } = req.body;

//     try {
//       const order = await Order.findById(orderId);

//       if (!order) {
//         return res.status(404).json({ message: "Order not found." });
//       }

//       // Assuming payment details are processed here
//       order.status = "paid";
//       await order.save();

//       res.status(200).json({ message: "Payment successful!", order });
//     } catch (error) {
//       res.status(500).json({ message: "Error processing payment.", error });
//     }
//   };
// }

// module.exports = new TableBookingController();
