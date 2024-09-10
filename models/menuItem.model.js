const mongoose=require("mongoose")

const MenuItemSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String
    },
    image:{
        type:String
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
    }
},{
    versionKey:false,
    timestamps:true
})
const MenuItem=new mongoose.model("MenuItem",MenuItemSchema)
module.exports=MenuItem;;