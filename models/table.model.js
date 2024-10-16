const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableNumber: { type: Number, required: true },
    seatCount: { type: Number, required: true },
    status: {
      type: String,
      // enum: ["available", "booked"],
      enum: ["available", "new", "wait", "served","done", "delivered"],
      default: "available",
    },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "order" }],
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const table =new mongoose.model("table", tableSchema);
module.exports = table;

