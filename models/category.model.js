const mongoose=require("mongoose")

const categorySchema=new mongoose.Schema({
    name:{type:String,required:true},
    image:{type:String,required:true},
    description:{type:String},
    isDeleted:{
        type:Boolean,
        default:false,
    }
},{
    versionKey:false,
    timestamps:true,
})
const category=new mongoose.model("category",categorySchema)
module.exports=category;