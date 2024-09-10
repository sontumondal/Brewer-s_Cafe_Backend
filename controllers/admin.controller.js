const Admin=require("../models/admin.model")
const bcrypt=require("bcrypt")
const {generateToken}=require("../utils/token")


class AdminController{
    async login(req,res){
        const {email, password}=req.body;
        const admin=await Admin.findOne({email})
        if(!admin || !(await bcrypt.compare(password, admin.password))){
            return res.status(401).json({message: "Invalid credentials"})
        }
        const token=generateToken(admin._id);
        res.status(200).json({token})
    }
}
module.exports=new AdminController()