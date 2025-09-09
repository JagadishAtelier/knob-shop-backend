const mongoose = require("mongoose");

const essentialImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  altText: {
    type: String,
    default: "",
  }
}, { _id: false });

const essebtialCategorySchema = new mongoose.Schema({
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
  },
  bannerImageUrl: {
    type: String,
    default: "https://placehold.co/200x200?text=Category+Banner+Image"
  },
  images: [essentialImageSchema],
  subpageType: { 
    type: String,
    default: ""
  }
}, { _id: false });


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
  categories: [essebtialCategorySchema],
  products : [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    }

  ]
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
