const mongoose = require("mongoose");

const shelfSchema = new mongoose.Schema({
    heading: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Shelf", shelfSchema);
