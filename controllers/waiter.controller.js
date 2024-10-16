


const Waiter = require("../models/waiter.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Order = require("../models/order.model");
const MenuItem =require("../models/menuItem.model")
const Table=require("../models/table.model")
const Category=require("../models/category.model")
const stripe = require("stripe")("your_stripe_secret_key");

class WaiterController {
  // Render Register Page
  renderRegister = async (req, res) => {
    try {
      res.render("waiter/register", {
        title: "Waiter Registration",
      });
    } catch (error) {
      console.log("Waiter Register error", error);
    }
  };

  // Render Login Page
  renderLogin = async (req, res) => {
    try {
      res.render("waiter/login", {
        title: "Waiter Login",
      });
    } catch (error) {
      console.log("Waiter login error", error);
    }
  };

  // Register waiter
  register = async (req, res) => {
    const { name, email, password } = req.body;

    // Check if cook exists
    const waiterExists = await Waiter.findOne({ email });
    if (waiterExists) {
      return res.status(400).json({ message: "waiter already exists" });
    }

    // Create new cook
    const waiter = new Waiter({ name, email, password });
    await waiter.save();

    // Generate JWT and store in cookies
    const token = this.generateToken(waiter._id);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/waiter/tables");
  };

  // Login waiter

  login = async (req, res) => {
    const { email, password } = req.body;
    const waiter = await Waiter.findOne({ email });

    // Check if cook exists and password is correct
    if (!waiter || !bcrypt.compareSync(password, waiter.password)) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT and store in cookies
    const token = this.generateToken(waiter._id);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/waiter/tables");
  };

  // Logout waiter
  logout = (req, res) => {
    res.clearCookie("token");
    res.redirect("/waiter/login");
  };

  // Generate JWT
  generateToken = (waiterId) => {
    return jwt.sign({ id: waiterId }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
  };

  // Protect Route Middleware
  protect = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect("/waiter/login");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.waiter = await Waiter.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.redirect("/waiter/login");
    }
  };

  // Render Dashboard Page
  dashboard = async (req, res) => {
    try {
      res.render("waiter/dashboard", {
        title: "Waiter Dashboard",
        waiter: req.waiter,
      });
    } catch (error) {
      console.log("Waiter dashboard error", error);
    }
  };

  renderTableBookingAndOrderPage = async (req, res) => {
    try {
      const menuItems = await MenuItem.find();
      res.render("waiter/bookTableOrder", {
        title: "Book Table & Order",
        waiter: req.waiter,
        menuItems,
      });
    } catch (error) {
      console.log("Error rendering table booking and order page", error);
    }
  };

  // Book Table and Place Order
  // bookTableAndOrder = async (req, res) => {
  //   try {
  //     const { tableNumber, seatCount, menuItems } = req.body;

  //     const table = await Table.create({
  //       tableNumber,
  //       seatCount,
  //       status: "booked",
  //     });

  //     const order = new Order({
  //       user: req.waiter._id,
  //       table: table._id,
  //       menuItems,
  //       totalPrice: this.calculateTotalPrice(menuItems),
  //       status: "pending",
  //       isPaid: false,
  //     });

  //     await order.save();
  //     res.redirect("/waiter/orders");
  //   } catch (error) {
  //     console.log("Error booking table and placing order", error);
  //     res
  //       .status(500)
  //       .json({ message: "Error booking table and placing order.", error });
  //   }
  // };
  // Book Table and Place Order
  // Book Table and Place Order
  // bookTableAndOrder = async (req, res) => {
  //   try {
  //     const { tableNumber, seatCount, selectedMenuItems, quantities } =
  //       req.body;

  //     // Ensure selectedMenuItems is an array
  //     const menuItemsArray = Array.isArray(selectedMenuItems)
  //       ? selectedMenuItems
  //       : [selectedMenuItems];

  //     // Find or create a table
  //     let table = await Table.findOne({ tableNumber });
  //     if (!table) {
  //       table = await Table.create({
  //         tableNumber,
  //         seatCount,
  //         status: "booked",
  //       });
  //     }

  //     // Fetch menu items from the database
  //     const menuItems = await MenuItem.find({ _id: { $in: menuItemsArray } });

  //     // Create a structured array with quantities
  //     const orderMenuItems = menuItems.map((item) => ({
  //       menuId: item._id, // Change from menuItemId to menuId
  //       quantity: quantities[item._id] ? parseInt(quantities[item._id]) : 1, // Default to 1 if no quantity provided
  //     }));

  //     // Calculate total price
  //     const totalPrice = this.calculateTotalPrice(orderMenuItems);

  //     // Create the order
  //     const order = new Order({
  //       user: req.waiter._id,
  //       table: table._id,
  //       menuItems: orderMenuItems, // Now matches the expected structure
  //       totalPrice,
  //       status: "pending",
  //       isPaid: false,
  //     });

  //     await order.save();
  //     res.redirect("/waiter/orders");
  //   } catch (error) {
  //     console.log("Error booking table and placing order", error);
  //     res
  //       .status(500)
  //       .json({ message: "Error booking table and placing order.", error });
  //   }
  // };

  // // Calculate Total Price Helper Function
  // calculateTotalPrice = (menuItems) => {
  //   let total = 0;
  //   menuItems.forEach((item) => {
  //     total += item.quantity * (item.menuId?.price || 0); // Safeguard against missing price
  //   });
  //   return total;
  // };
  bookTableAndOrder = async (req, res) => {
    try {
      const { tableNumber, seatCount, selectedMenuItems, quantities } =
        req.body;

      // Ensure selectedMenuItems is an array
      const menuItemsArray = Array.isArray(selectedMenuItems)
        ? selectedMenuItems
        : [selectedMenuItems];

      // Find or create a table
      let table = await Table.findOne({ tableNumber });
      if (!table) {
        table = await Table.create({
          tableNumber,
          seatCount,
          status: "booked",
        });
      }

      // Fetch menu items from the database
      const menuItems = await MenuItem.find({ _id: { $in: menuItemsArray } });

      // Log the fetched menu items to check their prices
      console.log("Fetched Menu Items:", menuItems);

      // Create a structured array with quantities
      const orderMenuItems = menuItems.map((item) => ({
        menuId: item._id,
        quantity: quantities[item._id] ? parseInt(quantities[item._id]) : 1,
      }));

      // Log the order menu items to ensure structure is correct
      console.log("Order Menu Items:", orderMenuItems);

      // Calculate total price
      const totalPrice = this.calculateTotalPrice(menuItems, orderMenuItems);

      // Log the total price
      console.log("Calculated Total Price:", totalPrice);

      // Create the order
      const order = new Order({
        user: req.waiter._id,
        table: table._id,
        menuItems: orderMenuItems,
        totalPrice,
        status: "pending",
        isPaid: false,
      });

      await order.save();
      res.redirect("/waiter/orders");
    } catch (error) {
      console.log("Error booking table and placing order", error);
      res
        .status(500)
        .json({ message: "Error booking table and placing order.", error });
    }
  };

  // Calculate Total Price Helper Function
  calculateTotalPrice = (menuItems, orderMenuItems) => {
    let total = 0;
    orderMenuItems.forEach((orderItem) => {
      const menuItem = menuItems.find((item) =>
        item._id.equals(orderItem.menuId)
      ); // Match based on menuId
      if (menuItem) {
        total += orderItem.quantity * (menuItem.price || 0); // Safeguard against missing price
      }
    });
    return total;
  };

  async viewAssignedOrders(req, res) {
    const { status, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const query = { user: req.waiter._id }; // Ensure this matches your schema
    if (status) query.status = status;

    try {
      console.log("Fetching orders for waiter:", req.waiter._id);
      const orders = await Order.find(query)
        .populate("table") // Ensure this is correct
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);
      const totalOrders = await Order.countDocuments(query);

      res.render("waiter/orders", {
        title: "Waiter Orders",
        orders,
        currentPage: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalOrders / limitNumber),
        waiter: req.waiter, // Pass the waiter object here
      });
    } catch (error) {
      console.error("Error retrieving orders:", error); // More detailed error logging
      res.status(500).json({ message: "Error retrieving orders.", error });
    }
  }

  // View Order Details
  async viewOrderDetails(req, res) {
    const { orderId } = req.params;
    try {
      const order = await Order.findById(orderId)
        .populate("menuItems.menuId") // Ensure menuId details are populated
        .populate("table"); // Populate table if needed
      if (!order) return res.status(404).json({ message: "Order not found." });

      console.log("Retrieved order:", order); // Debugging line
      res.render("waiter/orderDetails", { order });
    } catch (error) {
      console.error("Error retrieving order details:", error);
      res
        .status(500)
        .json({ message: "Error retrieving order details.", error });
    }
  }

  // Mark Order as Served
  // async markOrderAsServed(req, res) {
  //   const { orderId } = req.body;
  //   try {
  //     const order = await Order.findById(orderId);
  //     if (!order) return res.status(404).json({ message: "Order not found." });

  //     order.status = "delivered";
  //     await order.save();

  //     res.redirect("/waiter/orders");
  //   } catch (error) {
  //     res
  //       .status(500)
  //       .json({ message: "Error marking order as served.", error });
  //   }
  // }
  async confirmOrder(req, res) {
    const { orderId } = req.body;
    try {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found." });

      order.status = "confirmed";
      await order.save();
      res.redirect("/waiter/orders");
    } catch (error) {
      res.status(500).json({ message: "Error confirming order.", error });
    }
  }

  async prepareOrder(req, res) {
    const { orderId } = req.body;
    try {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found." });

      order.status = "preparing";
      await order.save();
      res.redirect("/waiter/orders");
    } catch (error) {
      res.status(500).json({ message: "Error preparing order.", error });
    }
  }

  async markOrderAsReady(req, res) {
    const { orderId } = req.body;
    try {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found." });

      order.status = "ready";
      await order.save();
      res.redirect("/waiter/orders");
    } catch (error) {
      res.status(500).json({ message: "Error marking order as ready.", error });
    }
  }

  async markOrderAsDelivered(req, res) {
    const { orderId } = req.body;
    try {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found." });

      order.status = "delivered";
      await order.save();
      res.redirect("/waiter/orders");
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error marking order as delivered.", error });
    }
  }

  // Render Profile Page
  async renderProfile(req, res) {
    try {
      res.render("waiter/profile", {
        title: "Waiter Profile",
        waiter: req.waiter,
      });
    } catch (error) {
      console.log("Error rendering profile page", error);
    }
  }

  // Update Profile
  async updateProfile(req, res) {
    const { name, password } = req.body;
    try {
      const waiter = await Waiter.findById(req.waiter._id);
      if (!waiter)
        return res.status(404).json({ message: "Waiter not found." });

      waiter.name = name || waiter.name;
      if (password) waiter.password = bcrypt.hashSync(password, 10);

      await waiter.save();
      res.redirect("/waiter/dashboard");
    } catch (error) {
      res.status(500).json({ message: "Error updating profile.", error });
    }
  }

  async updateOrderStatus(req, res) {
    const { orderId, newStatus } = req.body;
    try {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found." });

      // Check if the new status is valid
      const validStatuses = [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "delivered",
      ];
      if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({ message: "Invalid status." });
      }

      // Update the status
      order.status = newStatus;
      await order.save();

      res.redirect("/waiter/orders");
    } catch (error) {
      res.status(500).json({ message: "Error updating order status.", error });
    }
  }

  /////////////////////////////////////////////////////////////////////////////////

  async renderTableBooking(req, res) {
    res.render("bookTable", { title: "Book a Table" });
  }

  // Step 2: Handle table booking and redirect to menu selection
  async selectMenu(req, res) {
    const { tableNumber, seatCount } = req.query;

    // Optionally, store this information in session or database as needed
    req.session.tableNumber = tableNumber;
    req.session.seatCount = seatCount;

    // Fetch menu items
    const menuItems = await MenuItem.find();
    res.render("menuPage", { title: "Select Menu Items", menuItems });
  }

  // Step 3: Handle adding items to the cart
  async addToCart(req, res) {
    const { selectedMenuItems, quantities } = req.body;

    // Create or retrieve the cart (can be in session or database)
    if (!req.session.cart) {
      req.session.cart = [];
    }

    selectedMenuItems.forEach((itemId) => {
      const quantity = quantities[itemId] ? parseInt(quantities[itemId]) : 1;
      req.session.cart.push({ itemId, quantity });
    });

    res.redirect("/waiter/order-summary");
  }

  // Step 4: Render the order summary page
  async renderOrderSummary(req, res) {
    const cartItems = await Promise.all(
      req.session.cart.map(async (cartItem) => {
        const menuItem = await MenuItem.findById(cartItem.itemId);
        return {
          name: menuItem.name,
          price: menuItem.price,
          quantity: cartItem.quantity,
        };
      })
    );

    const totalPrice = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    res.render("orderSummary", {
      title: "Order Summary",
      cartItems,
      totalPrice,
    });
  }

  // Step 5: Handle confirming the order
  async confirmOrder(req, res) {
    const { totalPrice } = req.body;
    const { tableNumber, seatCount } = req.session;

    const order = new Order({
      // Adjust the user field as needed, e.g., req.waiter._id
      user: req.waiter._id,
      table: { tableNumber, seatCount }, // Assuming table is a simple object
      menuItems: req.session.cart,
      totalPrice,
      status: "pending",
      isPaid: false,
    });

    await order.save();

    // Clear the cart after placing the order
    req.session.cart = [];

    res.redirect("/waiter/orders"); // Redirect to orders page or any other page
  }

  // final/////////////////////////////////////////////////////////////////
  // Step 1: Render all tables
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
      res.render("waiter/tables", {
        title: "Available Tables",
        tables,
        totalOrdersCount,
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

  // Step 2: Render the modal for booking a table
  async renderTableBooking(req, res) {
    const { tableId } = req.params;
    const table = await Table.findById(tableId);
    res.render("waiter/tableBookingModal", { title: "Book a Table", table });
  }

  // Step 3: Handle booking the table and redirect to menu items
  // Step 3: Handle booking the table and redirect to menu items
  async bookTable(req, res) {
    const { tableId, status } = req.body; // Assuming 'status' is passed in the request body

    // Determine the status to update
    const newStatus = status === "new" ? "new" : "wait"; // Default to "wait" if not "new"

    // Update table status based on the condition
    await Table.findByIdAndUpdate(tableId, { status: newStatus });

    req.session.tableId = tableId; // Store table ID in session
    res.redirect("/waiter/menu");
  }

  async bookNew(req, res) {
    const { tableId } = req.body;

    // Update table status to wait when booked
    await Table.findByIdAndUpdate(tableId, { status: "new" });

    req.session.tableId = tableId; // Store table ID in session
    res.redirect("/waiter/tables");
  }

  // Step 4: Handle serving the table
  async serveTable(req, res) {
    const { tableId } = req.body;

    // Update table status to served
    await Table.findByIdAndUpdate(tableId, { status: "served" });

    res.redirect("/waiter/tables"); // Redirect to an appropriate page
  }

  // Step 5: Handle delivering the table
  async deliverTable(req, res) {
    const { tableId } = req.body;

    // Update table status to delivered
    await Table.findByIdAndUpdate(tableId, { status: "delivered" });

    res.redirect("/waiter/tables"); // Redirect to an appropriate page
  }

  // Step 4: Render all menu items
  async renderMenuItems(req, res) {
    try {
      const { q, limit = 8, skip = 0 } = req.query;

      let query = {};

      if (q) {
        query = {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
          ],
        };

        // Optionally, match category if necessary
        const categories = await Category.find({
          name: { $regex: q, $options: "i" },
        }).select("_id");
        if (categories.length > 0) {
          query.$or.push({ category: { $in: categories.map((c) => c._id) } });
        }
      }

      const totalItems = await MenuItem.countDocuments(query);
      const menuItems = await MenuItem.find(query)
        .skip(Number(skip))
        .limit(Number(limit));

      // For AJAX requests, return the items directly
      if (req.xhr) {
        return res.render("partial/waiter/menuItems", {
          // title: "Menu Items",
          menuItems,
        });
      }

      // For full page load
      res.render("waiter/menuItems", {
        title: "Menu Items",
        menuItems,
        totalItems,
        currentPage: Math.floor(Number(skip) / Number(limit)) + 1,
        totalPages: Math.ceil(totalItems / Number(limit)),
        searchQuery: q,
        limit: Number(limit), // Pass limit here
      });
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ error: "Server error while fetching menu items" });
    }
  }

  // Step 5: Render a single menu item
  async renderSingleMenu(req, res) {
    const { menuId } = req.params;
    const menuItem = await MenuItem.findById(menuId);
    res.render("waiter/singleMenu", { title: "Menu Item", menuItem });
  }

  // Step 6: Handle adding items to the cart
  async addToCart(req, res) {
    const { menuId, quantity } = req.body;

    if (!req.session.cart) {
      req.session.cart = [];
    }

    req.session.cart.push({ menuId, quantity: parseInt(quantity) });

    res.redirect("/waiter/order-summary");
  }

  // Step 7: Render the order summary page
  async renderOrderSummary(req, res) {
    // Ensure req.session.cart is defined
    const cart = req.session.cart || []; // Default to empty array if undefined

    // Map over the cart to get the menu items
    const cartItems = await Promise.all(
      cart.map(async (cartItem) => {
        const menuItem = await MenuItem.findById(cartItem.menuId);
        return {
          name: menuItem ? menuItem.name : "Unknown Item", // Fallback for undefined menu item
          price: menuItem ? menuItem.price : 0,
          quantity: cartItem.quantity,
          image: menuItem.image,
        };
      })
    );

    const totalPrice = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    res.render("waiter/orderSummary", {
      title: "Order Summary",
      cartItems,
      totalPrice,
    });
  }

  // Step 8: Handle confirming the order
  async confirmOrder(req, res) {
    const { totalPrice } = req.body;

    // Check if waiter is authenticated
    if (!req.waiter || !req.waiter._id) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    // Check if tableId is present in the session
    if (!req.session.tableId) {
      return res.status(400).json({ message: "Table ID is required." });
    }

    try {
      const order = new Order({
        user: req.waiter._id,
        table: req.session.tableId, // Ensure this is set correctly
        menuItems: req.session.cart,
        totalPrice,
        status: "pending",
        isPaid: false,
      });

      await order.save();

      // Clear the cart after placing the order
      req.session.cart = [];

      // Update the table status back to available if needed
      await Table.findByIdAndUpdate(req.session.tableId, {
        status: "available",
      });

      res.redirect("/waiter/order"); // Redirect to orders page
    } catch (error) {
      console.error("Error confirming order:", error.message);
      res.status(500).send("Error confirming order");
    }
  }

  // Step 9: Render the orders page
  async renderOrders(req, res) {
    try {
      const orders = await Order.find({ user: req.waiter._id })
        .populate("table") // Populate table details if needed
        .populate("menuItems.menuId"); // Populate menu item details

      res.render("waiter/order", { title: "Your Orders", orders });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).send("Internal Server Error");
    }
  }
  // Step 10: Render order details
  async viewOrderDetails(req, res) {
    const { orderId } = req.params;
    try {
      const order = await Order.findById(orderId)
        .populate("menuItems.menuId")
        .populate("table"); // Populate menu item details
      if (!order) return res.status(404).json({ message: "Order not found." });

      res.render("waiter/ordersDetail", { title: "Order Details", order });
    } catch (error) {
      console.error("Error retrieving order details:", error);
      res
        .status(500)
        .json({ message: "Error retrieving order details.", error });
    }
  }

  // Step 11: Mark order as served
  async markOrderAsServed(req, res) {
    const { orderId } = req.body; // Ensure this is correct
    try {
      const order = await Order.findById(orderId); // This should work if orderId is valid
      if (!order) return res.status(404).json({ message: "Order not found." });

      order.status = "delivered"; // Update status
      await order.save();

      res.redirect("/waiter/order"); // Redirect to orders page
    } catch (error) {
      console.error("Error marking order as served:", error);
      res
        .status(500)
        .json({ message: "Error marking order as served.", error });
    }
  }

  async processPayment(req, res) {
    const { orderId, paymentMethodId } = req.body;
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found." });
      }

      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: order.totalPrice * 100, // Amount in cents
        currency: "usd", // Change to your currency
        payment_method: paymentMethodId,
        confirm: true,
      });

      // Update order to mark as paid
      order.isPaid = true;
      order.paymentDetails = paymentIntent;
      await order.save();

      res.redirect("/waiter/order"); // Redirect to orders page
    } catch (error) {
      console.error("Payment error:", error);
      res.status(500).json({ message: "Payment processing error.", error });
    }
  }
}

module.exports = new WaiterController();


  // View Assigned Orders with Pagination and Filtering
  // View Assigned Orders with Pagination and Filtering
  // async viewAssignedOrders(req, res) {
  //   const { status, page = 1, limit = 10 } = req.query; // Get limit from query or default to 10
  //   const pageNumber = parseInt(page) || 1;
  //   const limitNumber = parseInt(limit) || 10;

  //   const query = { assignedTo: req.waiter._id };
  //   if (status) query.status = status;

  //   try {
  //     const orders = await Order.find(query)
  //       .skip((pageNumber - 1) * limitNumber)
  //       .limit(limitNumber);
  //     const totalOrders = await Order.countDocuments(query);

  //     res.render("waiter/orders", {
  //       title: "Waiter Order",
  //       orders,
  //       currentPage: pageNumber,
  //       limit: limitNumber, // Pass limit to EJS
  //       totalPages: Math.ceil(totalOrders / limitNumber),
  //     });
  //   } catch (error) {
  //     res.status(500).json({ message: "Error retrieving orders.", error });
  //   }
  // }

  // // View Order Details
  // async viewOrderDetails(req, res) {
  //   const { orderId } = req.params;
  //   try {
  //     const order = await Order.findById(orderId).populate("menuItem");
  //     if (!order) {
  //       return res.status(404).json({ message: "Order not found." });
  //     }
  //     res.render("waiter/orderDetails", { order });
  //   } catch (error) {
  //     res
  //       .status(500)
  //       .json({ message: "Error retrieving order details.", error });
  //   }
  // }

  // // Mark Order as Served
  // async markOrderAsServed(req, res) {
  //   const { orderId } = req.body;

  //   try {
  //     const order = await Order.findById(orderId);
  //     if (!order) {
  //       return res.status(404).json({ message: "Order not found." });
  //     }

  //     order.status = "served";
  //     await order.save();

  //     res.redirect("/waiter/orders");
  //   } catch (error) {
  //     res
  //       .status(500)
  //       .json({ message: "Error marking order as served.", error });
  //   }
  // }

  // // Render Profile Page
  // async renderProfile(req, res) {
  //   try {
  //     res.render("waiter/profile", {
  //       title: "Waiter Profile",
  //       waiter: req.waiter,
  //     });
  //   } catch (error) {
  //     console.log("Error rendering profile page", error);
  //   }
  // }

  // // Update Profile
  // async updateProfile(req, res) {
  //   const { name, password } = req.body;
  //   try {
  //     const waiter = await Waiter.findById(req.waiter._id);
  //     if (!waiter) {
  //       return res.status(404).json({ message: "Waiter not found." });
  //     }

  //     waiter.name = name || waiter.name;
  //     if (password) {
  //       waiter.password = bcrypt.hashSync(password, 10);
  //     }
  //     await waiter.save();

  //     res.redirect("/waiter/dashboard");
  //   } catch (error) {
  //     res.status(500).json({ message: "Error updating profile.", error });
  //   }
  // }

  // Render Table Booking and Menu Ordering Page


  
//   // View assigned orders
//   async viewAssignedOrders(req, res) {
//     try {
//       const orders = await Order.find({ assignedTo: req.user.id });
//       res.render("waiter/orders", { orders });
//     } catch (error) {
//       res.status(500).json({ message: "Error retrieving orders.", error });
//     }
//   }

//   // Mark order as served
//   async markOrderAsServed(req, res) {
//     const { orderId } = req.body;

//     try {
//       const order = await Order.findById(orderId);
//       if (!order) {
//         return res.status(404).json({ message: "Order not found." });
//       }

//       order.status = "served";
//       await order.save();

//       res.redirect("/waiter/orders");
//     } catch (error) {
//       res
//         .status(500)
//         .json({ message: "Error marking order as served.", error });
//     }
//   }
// }

// module.exports = new WaiterController();