const mongoose = require("mongoose");

const shelfSchema = new mongoose.Schema({
    heading: { type: String },
    content: { type: String },
    imageUrl: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Shelf", shelfSchema);
