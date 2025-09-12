const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Sub-schema: Payment Record
const paymentSchema = new mongoose.Schema(
  {
    amount: Number,
    date: { type: Date, default: Date.now },
    method: String,
    status: String,
    orderId: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "User" },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    phone: { type: String, unique: true, sparse: true },
    profileUrl: { type: String, default: "" },
    gender: { type: String },
    company: { type: String, default: "" },
    GST: { type: String, default: "" },
    password: { type: String, required: true },
    usedCoupons: [{ type: String }],
    dateofbirth: { type: Date },
    address: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    paymentHistory: [paymentSchema],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("FrontUser", userSchema);
