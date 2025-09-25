const mongoose = require("mongoose");

const essentialImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  altText: { type: String, default: "" },
}, { _id: false });

const essentialCategorySchema = new mongoose.Schema({
  category_name: { type: String, required: true, trim: true, unique: true },
  description: { type: String },
  categoryImageUrl: { type: String, default: "https://placehold.co/200x200?text=Category+Image" },
  bannerImageUrl: { type: String, default: "https://placehold.co/200x200?text=Category+Banner+Image" },
  images: [essentialImageSchema],
  subpageType: { type: String, default: "" }
}, { _id: false });

// Schema for each slider inside a card
const sliderSchema = new mongoose.Schema({
  image: { type: String, required: true },
  subtit: { type: String, default: "" },
  title: { type: String, default: "" },
  description: { type: String, default: "" },
}, { _id: false });

// Schema for each card
const cardSchema = new mongoose.Schema({
  number: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  bgImage: { type: String },
  categories: [essentialCategorySchema],
  sliders: [sliderSchema], // array of slider objects
  products: [                // separate array of product ObjectIds
    { type: mongoose.Schema.Types.ObjectId, ref: "Product" }
  ]
});

// Main Essentials schema
const essentialsSchema = new mongoose.Schema({
  mainHeading: { type: String, required: true },
  mainDescription: { type: String, required: true },
  cards: [cardSchema],
});

const Essentials = mongoose.model("Essentials", essentialsSchema);

module.exports = Essentials;
