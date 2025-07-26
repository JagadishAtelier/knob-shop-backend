// models/brochure.js

const mongoose = require("mongoose");

const brochureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  images: [{ type: String }],
  pdfLink: { type: String },
  category: { type: String },
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

module.exports = mongoose.model("Brochure", brochureSchema);
