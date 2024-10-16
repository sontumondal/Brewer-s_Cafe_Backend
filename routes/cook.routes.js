const router = require("express").Router();
const CookController = require("../controllers/cook.controller");

router.get("/", (req, res) => {
  res.render("cook/cookbanner");
});
// Route to render the cook registration page
router.get("/register", CookController.renderRegister);

// Route to handle cook registration form submission
router.post("/register", CookController.register);

// Route to render the cook login page
router.get("/login", CookController.renderLogin);

// Route to handle cook login form submission
router.post("/login", CookController.login);

// Route to logout the cook
router.get("/logout", CookController.logout);

// Protect the following routes to ensure only logged-in cooks can access them
router.use(CookController.protect);

// Route to render the cook dashboard
router.get("/dashboard", CookController.dashboard);
// Route to render all tables with their statuses
router.get("/tables", CookController.renderTables);

// Route to render details for a specific table
router.get("/table/:tableId", CookController.renderTableDetails);

// Route to update the status of an order
router.post("/order/update", CookController.updateOrderStatus);

// Route to render all pending orders
router.get("/orders/pending", CookController.renderPendingOrders);

// Route to render all delivered orders
router.get("/orders/delivered", CookController.renderDeliveredOrders);

module.exports = router;

// router.get("/list", CookController.list);
// // Route to view the pending orders (Orders with status: pending)
// router.get("/orders", CookController.viewPendingOrders);

// // Route to list the orders assigned to the cook
// router.get("/assigned-orders", CookController.listOrders);

// // Route to render the order confirmation page
// router.get("/order/confirm/:orderId", CookController.renderConfirmOrder); // New route for confirmation page

// // Route to handle order confirmation (status update to "confirmed")
// router.post("/order/confirm", CookController.confirmOrder);

// // Route to handle updating the status of an order (like preparing, ready)
// router.post("/order/update", CookController.updateOrderStatus);