// models/Coupon.js
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ["percentage", "flat", "bundle"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    // New: Start date for scheduled coupons
    startDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // New: Field to specify coupon application scope
    appliesTo: {
      type: String,
      enum: ["all", "single"],
      default: "all",
    },
    // New: Product ID for single-product coupons
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
