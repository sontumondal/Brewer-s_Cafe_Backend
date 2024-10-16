const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const cookSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
},{
    versionKey:false,
    timestamps:true,
});

// Hash the password before saving
cookSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

const cook =new mongoose.model("cook", cookSchema);
module.exports = cook;
