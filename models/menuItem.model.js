const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: { type: Number },
    description: {
      type: String,
    },
    ingredients: { type: String },
    image: {
      type: [String],
      required:false,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
const menuItem = new mongoose.model("menuItem", menuItemSchema);
module.exports = menuItem;
