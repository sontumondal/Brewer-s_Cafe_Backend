const express=require("express")
const path=require("path")
const bodyParser=require("body-parser")
const cors=require("cors")
const session=require("express-session")
const cookieParser=require("cookie-parser")
require("dotenv").config()
const db=require("./config/database")
const { ApiError } = require("./utils/ApiError");
const { ApiResponse } = require("./utils/ApiResponse");
const authMiddleware=require("./middlewares/auth")

const adminRoutes=require("./routes/admin.routes")
const categoryRoutes=require("./routes/category.routes")
const menuItemRoutes=require("./routes/menuItem.routes")


const app=express()

app.use(cors({
    credentials:true,
}))
app.use(session({
    secret:"MySecretKey",
    resave:false,
    saveUninitialized:true,
}))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use("/uploads",express.static(path.join(__dirname, "uploads")))
app.use(authMiddleware)
app.use("/admin", adminRoutes)
app.use("/categories", categoryRoutes)
app.use("/menu-items", menuItemRoutes)
app.use((err,req,res,next)=>{
    if(err instanceof ApiError){
        res.status(err.statusCode).json(new ApiResponse(err.statusCode, null, err.message))
    }else{
        res.status(500).json(new ApiResponse(500, null, "Internal Server Error !"))
    }
})

const PORT=process.env.PORT || 3000
const HOST="0.0.0.0";

app.listen(PORT, HOST ,async ()=>{
    await db.dbConnect();
    console.log(`Server is running on http://${HOST}:${PORT}`)
})

