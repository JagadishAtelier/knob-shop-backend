const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    productId: { type: String, required: true },
    hsncode: { type: String, required:true },
    description: { type: String },
    brand: { type: String },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    stock: { type: Number, default: 0 },

    images: [String], // Main images
    video: String, // YouTube video URL
    brochure: String, // PDF brochure link

    // Features (with image)
    features: [
      {
        heading: String,
        description: String,
        image: String,
      },
    ],

    // Color variants with sizes
    variant: [
      {
        title: String, // color name
        value: String, // color code (hex)
        price: Number,
        images: [
          {
            url: String,
            deleteToken: String,
          },
        ],
        sizes: [
          {
            label: String,
            mrp: Number,
            discountPercentage: Number,
            taxPercentage: Number,
            sellingPrice: Number,
            stock: Number,
          },
        ],
      },
    ],

    // Key Features (icons + title)
    key_features: [
      {
        title: String,
        image: String,
      },
    ],

    // Technical specifications
    tech_spec: [
      {
        title: String,
        value: String,
      },
    ],

    // Installation info
    installation: {
      videoUrl: String,
      content: String,
    },
    discount: {
      type: {
        type: String,
        enum: ["percentage", "fixed"],
        default: null,
      },
      value: { type: Number, default: 0 },
      startDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
      isActive: { type: Boolean, default: false },
    },

    // Product dimensions
    dimensions: {
      weight: Number,
      height: Number,
      width: Number,
      length: Number,
    },
    brochure: String,
    //for tracking who created the product
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, // will added by controller using token
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
