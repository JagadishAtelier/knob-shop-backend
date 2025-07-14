const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  category_name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String
  },
  categoryImageUrl: {
    type: String,
    default: "https://placehold.co/200x200?text=Category+Image"
  }
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);
