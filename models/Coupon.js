const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ["flat", "percent"], required: true },
  value: { type: Number, required: true }, // discount value
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);
