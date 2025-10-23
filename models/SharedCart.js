const mongoose = require("mongoose");

const SharedCartSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  items: { type: Array, required: true }, // directly store cart items
  createdAt: { type: Date, default: Date.now, expires: "7d" } // auto-delete after 7 days
});

module.exports = mongoose.model("SharedCart", SharedCartSchema);