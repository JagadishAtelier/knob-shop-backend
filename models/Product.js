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
    brochure: String,
  //for tracking who created the product
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, // will added by controller using token
      ref: 'User',
      required: true,
    }

  }, { timestamps: true }); 

  module.exports = mongoose.model('Product', productSchema);
