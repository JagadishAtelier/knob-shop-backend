const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "FrontUser", 
    required: true 
  },

  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  },

  // Variant data
  colorName: { type: String },
  colorCode: { type: String },
  sizeLabel: { type: String },

  mrp: Number,
  discountPercentage: Number,
  taxPercentage: Number,
  sellingPrice: Number,

  image: String,

  quantity: { type: Number, default: 1 },
});

module.exports = mongoose.model("Cart", cartSchema);
