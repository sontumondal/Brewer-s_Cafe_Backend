const mongoose=require("mongoose")
const DB_NAME=require("../constant")
require("dotenv").config()

const MONGODB_URI =process.env.MONGODB_URI || "mongodb://localhost:27017/brewerscafe";
class MongoDbConnection{
    async dbConnect(){
        try {
            await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);
            console.log("MongoDB connected !!")
        } catch (error) {
            console.log("mongoDb connection failed !!!",error)
            process.exit(1)
        }
    }
}
module.exports=new MongoDbConnection()