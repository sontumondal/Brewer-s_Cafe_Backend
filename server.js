const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

require("dotenv").config({path:"./.env"});
const db = require("./config/database");
const { ApiError } = require("./utils/ApiError");
const { ApiResponse } = require("./utils/ApiResponse");
const authMiddleware = require("./middlewares/auth");

const adminRoutes = require("./routes/admin.routes");
const categoryRoutes = require("./routes/category.routes");
const menuItemRoutes = require("./routes/menuItem.routes");
const tableRoutes=require("./routes/table.routes")
const waiterRoutes=require("./routes/waiter.routes")
const cookRoutes=require("./routes/cook.routes")
const authRoutes=require("./routes/user.routes")
const app = express();
app.set("view engine","ejs")
app.set("views","views")
app.use(
  cors({
    credentials: true,
  })
);
app.use(
  session({
    secret: "MySecretKey",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname,"public")))
// app.use(authMiddleware);
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});
app.use("/", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api",tableRoutes)
app.use("/waiter",waiterRoutes)
app.use("/cook",cookRoutes)
app.use("/api/auth",authRoutes)
// app.use((err, req, res, next) => {
//   console.error("Error caught: ", err.stack); // Full error stack trace

//   if (err instanceof ApiError) {
//     res
//       .status(err.statusCode)
//       .json(new ApiResponse(err.statusCode, null, err.message));
//   } else {
//     console.error("Unexpected error:", err);

//     res.status(500).json(new ApiResponse(500, null, "Internal Server Error !"));
//   }
// });
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});
console.log("JWT Secret: ", process.env.JWT_SECRET); // Log to check if JWT_SECRET is loaded

const PORT = process.env.PORT || 3000;
// const HOST = "192.168.0.161";

app.listen(PORT,  async () => {
  await db.dbConnect();
  console.log(`Server is running on ${PORT}`);
});
