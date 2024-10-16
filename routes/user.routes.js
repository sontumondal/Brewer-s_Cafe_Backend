const router = require("express").Router();
const userController = require("../controllers/user.controller");
const upload = require("../middlewares/uploadsingle");

router.post(
  "/register",
  upload.single("profilePicture"),
  userController.registerUser
);
router.post("/login", userController.loginUser);
router.post("/sent-otp", userController.sendOtp);
router.get("/view-order",userController.viewOrders)

module.exports=router;





// const express = require("express");
// const router = express.Router();
// const userController = require("../controllers/UserController");

// router.post("/register", userController.register);
// router.post("/login", userController.login);
// router.post("/book-table", userController.bookTable);
// router.get("/view-orders", userController.viewOrders);

// module.exports = router;
