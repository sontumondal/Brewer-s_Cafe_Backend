const mongoose=require("mongoose")

const bcrypt=require("bcrypt")

const AdminSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        unique:true,
    }
},{
    versionKey:false,
    timestamps:true,
})

AdminSchema.pre("save", async function(next){
    if (!this.isModified("password")) {
        return next()
    }
    this.password=await bcrypt.hash(this.password,10)
    next()
})

const Admin=new mongoose.model("Admin",AdminSchema)
module.exports=Admin;