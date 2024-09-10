const mongoose=require("mongoose")

const CategorySchema=new mongoose.Schema({
    name:{type:String,required:true},
    image:{type:String,required:true},
},{
    versionKey:false,
    timestamps:true,
})
const Category=new mongoose.model("Category",CategorySchema)
module.exports=Category;