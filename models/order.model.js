const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "table",
      required: true,
    },
    cook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cook",
    },
    menuItems: [
      {
        menuId: { type: mongoose.Schema.Types.ObjectId, ref: "menuItem" },
        quantity: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "done", "delivered"], // Changed "ready" to "done"
      default: "pending", // Default status is "pending"
    },
    isPaid: { type: Boolean, default: false },
    paymentDetails: { type: Object },
    orderedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const order = new mongoose.model("order", orderSchema);
module.exports = order;
