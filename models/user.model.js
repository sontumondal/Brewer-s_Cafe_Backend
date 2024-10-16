const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone_no: { type: String, required: true, unique: true },
  otp: { type: String },
  otp_expiry: { type: Date },
  profilePicture: { type: String }, 
},{
  versionKey:false,
  timestamps:true,
});

const user =new mongoose.model("user", userSchema);
module.exports = user;
