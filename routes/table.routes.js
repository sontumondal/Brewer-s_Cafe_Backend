
const router = require("express").Router();
const TableBookingController = require("../controllers/table.controller");
const TableController=require("../controllers/tablemanagement.controller")
const AdminController=require("../controllers/admin.controller")
// API Routes
router.get("/tables", TableBookingController.getAvailableTables);
router.post(
  "/book-tables",
  TableBookingController.verifyToken,
  TableBookingController.bookTable
);
router.post(
  "/order",
  TableBookingController.verifyToken,
  TableBookingController.placeOrder
);
router.post("/order/update", TableBookingController.updateOrderStatus);
router.post(
  "/payment",
  TableBookingController.verifyToken,
  TableBookingController.processPayment
);
router.get("/view-order",
  TableBookingController.verifyToken,
  TableBookingController.viewOrderDetails
)
// Admin Panel Routes (EJS)
router.get("/admin/tables", TableBookingController.getAvailableTables); // Render tables
router.get("/admin/orders", TableBookingController.getOrdersForAdmin); // Render orders

router.get("/table", TableController.addForm)
router.get("/table/edit/:id",TableController.editForm)
router.post("/table/add",TableController.add)
router.post("/table/update/:id",TableController.update)
router.get("/table/list",TableController.list)
router.get("/table/delete/:id",TableController.delete)

module.exports = router;



// const express = require("express");
// const router = express.Router();
// const TableBookingController = require("../controllers/TableBookingController");

// // API Routes
// router.get("/tables", TableBookingController.getAvailableTables);
// router.post(
//   "/book",
//   TableBookingController.verifyToken,
//   TableBookingController.bookTable
// );
// router.post(
//   "/order",
//   TableBookingController.verifyToken,
//   TableBookingController.placeOrder
// );
// router.post("/order/update", TableBookingController.updateOrderStatus);
// router.post(
//   "/payment",
//   TableBookingController.verifyToken,
//   TableBookingController.processPayment
// );

// // Admin Panel Routes (EJS)
// router.get("/admin/tables", TableBookingController.getAvailableTables); // Render tables
// router.get("/admin/orders", TableBookingController.getOrdersForAdmin); // Render orders

// module.exports = router;
// const express = require("express");
// const TableBookingController = require("../controllers/table.controller");
// const router = express.Router();

// // Middleware to verify token
// router.use(TableBookingController.verifyToken);

// // Route to get available tables
// router.get("/tables", TableBookingController.getAvailableTables);

// // Route to book a table
// router.post("/tables/book", TableBookingController.bookTable);

// // Route to place an order
// router.post("/orders/place", TableBookingController.placeOrder);

// // Route to update order status
// router.patch("/orders/status", TableBookingController.updateOrderStatus);

// // Route to process payment
// router.post("/orders/payment", TableBookingController.processPayment);

// module.exports = router;