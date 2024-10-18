const router = require("express").Router();
const WaiterController = require("../controllers/waiter.controller");

// Middleware to protect routes
// router.use(WaiterController.protect);


router.get("/",(req,res)=>{
    res.render("waiter/waiterbanner")
})
// Register and Login Routes
router.get("/register", WaiterController.renderRegister);
router.post("/register", WaiterController.register);
router.get("/login", WaiterController.renderLogin);
router.post("/login", WaiterController.login);
router.get("/logout", WaiterController.logout);

// Dashboard Route
router.get("/dashboard", WaiterController.dashboard);

// Order Routes
// router.get("/orders", WaiterController.viewAssignedOrders);
// router.get("/orders/:orderId", WaiterController.viewOrderDetails);
// // router.post("/orders/serve", WaiterController.markOrderAsServed);
// router.get("/book-table-order", WaiterController.renderTableBookingAndOrderPage); // Render booking page
// router.post("/book-table-order", WaiterController.bookTableAndOrder); // Handle booking and order submission
// Order Routes
// router.post("/orders/confirm", WaiterController.confirmOrder);
// router.post("/orders/prepare", WaiterController.prepareOrder);
// router.post("/orders/mark-ready", WaiterController.markOrderAsReady);
// router.post("/orders/serve", WaiterController.markOrderAsDelivered);

// router.post("/orders/update-status", WaiterController.updateOrderStatus);
// Step 1: Render all tables
router.get('/tables', WaiterController.renderTables);

// Step 2: Render the modal for booking a table
router.get('/tables/:tableId/book', WaiterController.renderTableBooking);

// Step 3: Handle booking the table
router.post('/tables/book', WaiterController.bookTable);
router.post('/tables/new', WaiterController.bookNew);
router.post("/tables/serveTable", WaiterController.serveTable);
router.post("/tables/deliverTable", WaiterController.deliverTable);
// Step 4: Render all menu items
router.get('/menu', WaiterController.renderMenuItems);

// Step 5: Render a single menu item
router.get('/menu/:menuId', WaiterController.renderSingleMenu);

// Step 6: Handle adding items to the cart
router.post('/menu/add-to-cart', WaiterController.addToCart);

// Step 7: Render the order summary
router.get('/order-summary', WaiterController.renderOrderSummary);

// Step 8: Handle confirming the order
router.post('/order/confirm', WaiterController.confirmOrder);
// step-9
router.get("/order", WaiterController.renderOrders);
// step-10
router.get("/orders/:orderId", WaiterController.viewOrderDetails); // View order details
// step-11
router.post("/orders/serve", WaiterController.markOrderAsServed); // Mark order as served
router.post("/payment", WaiterController.processPayment);

// Route to book a table
// router.get("/book-table", WaiterController.renderTableBooking);
// router.get("/select-menu", WaiterController.selectMenu);
// router.post("/add-to-cart", WaiterController.addToCart);
// router.get("/order-summary", WaiterController.renderOrderSummary);
// router.post("/confirm-order", WaiterController.confirmOrder);

// Table Booking Route
// router.get("/book-table", WaiterController.renderTableBookingPage); // Render table booking page
// router.post("/book-table", WaiterController.bookTable); // Handle table booking

// Menu Routes
// router.get("/select-menu", WaiterController.renderMenuPage); // Render menu page
// router.get("/menu/:menuId", WaiterController.renderSingleMenuPage); // Render single menu item
// router.post("/add-to-cart", WaiterController.addToCart); // Add item to cart
// Profile Routes
router.get("/profile", WaiterController.renderProfile);
router.post("/update-profile", WaiterController.updateProfile);

module.exports = router;
