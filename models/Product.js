  const mongoose = require('mongoose');

  const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    compare_price: { type: Number },
    stock: { type: Number, default: 0 },
    productId: { type: String },
    status: {
      type: String,
      enum: ['active', 'inactive', 'outofstock'],
      default: 'active',
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    brand: String,
    images: [String],
    video: String,

    features: [
      {
        title: String,
        description: String,
        image: String,
      }
    ],
    key_features: [
      {
        title: String,
        image: String,
      }
    ],
    tech_spec: [
      {
        title: String,
        value: String,
      }
    ],
    variant: [
      {
        title: String,
        value: String,
        images: [String],
        price: Number,
        sizes: [
        {
          label: { type: String, required: true }, // e.g., "Small", "4x4"
          price: { type: Number, required: true, default: 0 }, // Price adjustment for this size (relative to variant price)
          stock: { type: Number, required: true, default: 0 }, // Stock for this specific size
        }]
      }
    ],
    discount: {
      type: {
        type: String,
        enum: ["percentage", "fixed"],
        default: null,
      },
      value: Number,
      startDate: Date,
      endDate: Date,
      isActive: { type: Boolean, default: false }
    },
    dimensions: {
      weight: Number,
      height: Number,
      width: Number,
      length: Number,
    },
    installation: {
    videoUrl: String, // To store the YouTube video URL
    content: String,  // To store the installation text content
  },
    brochure: String,
  //for tracking who created the product
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, // will added by controller using token
      ref: 'User',
      required: true,
    }

  }, { timestamps: true }); 

  module.exports = mongoose.model('Product', productSchema);
