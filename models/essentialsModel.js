const mongoose = require("mongoose");

// Schema for each individual card
const cardSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  bgImage: {
    type: String, // URL to the image uploaded on DigitalOcean Spaces
    required: false,
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId, // Use an array for multiple ObjectIds
      ref: "Category", // The name of the model you are referencing
    },
  ],
});

// Main schema for the Essentials section
const essentialsSchema = new mongoose.Schema({
  mainHeading: {
    type: String,
    required: true,
  },
  mainDescription: {
    type: String,
    required: true,
  },
  cards: [cardSchema], // Array of card objects
});

const Essentials = mongoose.model("Essentials", essentialsSchema);

module.exports = Essentials;
