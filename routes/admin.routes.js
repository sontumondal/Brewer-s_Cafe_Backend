const router = require("express").Router();
const authController = require("../controllers/admin.controller");
//render welcome page
router.get("/",(req,res)=>{
    return res.render("welcomepage",{
        title:"Brewer's Cafe",
    })
})
// Render Register Page
router.get("/register", authController.renderRegister);

// Render Login Page
router.get("/login", authController.renderLogin);

// Handle Registration
router.post("/register", authController.register);

// Handle Login
router.post("/login", authController.login);
// Handle Logout
router.get('/logout', authController.logout);  // Logout route
// Render Dashboard (protected route)
router.get("/dashboard", authController.protect, authController.dashboard);
router.get("/admin/orders",authController.viewOrders)
router.post("/admin/update-order",authController.updateOrderStatus)
module.exports = router;




// const express = require("express");
// const router = express.Router();
// const adminController = require("../controllers/AdminController");
// const waiterController = require("../controllers/WaiterController");
// const cookController = require("../controllers/CookController");

// // Admin Routes
// router.get("/admin/login", adminController.login);
// router.get("/admin/orders", adminController.viewOrders);
// router.post("/admin/update-order", adminController.updateOrderStatus);

// // Waiter Routes
// router.get("/waiter/login", waiterController.login);
// router.get("/waiter/orders", waiterController.viewAssignedOrders);
// router.post("/waiter/serve-order", waiterController.markOrderAsServed);

// // Cook Routes
// router.get("/cook/login", cookController.login);
// router.get("/cook/orders", cookController.viewPendingOrders);
// router.post("/cook/confirm-order", cookController.confirmOrder);

// module.exports = router;
