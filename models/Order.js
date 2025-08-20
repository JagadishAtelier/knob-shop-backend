// models/Order.js
const mongoose = require("mongoose");
const Counter = require("./Counter");

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true }, // Auto-generated order ID
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FrontUser",
    required: true,
  },
  items: [
    {
      productId: {
        type: String, // <-- fix here
        required: true
      },
      productName: { type: String },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      total: { type: Number }
    }
  ],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    name: { type: String },
    phone: { type: String},
    street: { type: String},
    city: { type: String},
    district: { type: String},
    pincode: { type: String},
    state: { type: String },
  },
  dtdcReferenceNumber: { type: String },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    default: "pending"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "success", "failure","refund"],
    default: "pending"
  },
  paymentMethod: {
    type: String,
    enum: ["cod", "upi", "card", "netbanking","online"],
    default: "cod"
  },
  paymentReference: { type: String },
  gstNumber: { type: String},
  companyName: { type: String},  
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to generate auto-incremented orderId like 'ORD-0001'
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: "orderId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const formattedId = String(counter.seq).padStart(4, "0");
      this.orderId = `ORD-${formattedId}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("Order", orderSchema);
