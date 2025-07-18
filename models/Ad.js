const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  adMode: {
    type: String,
    enum: ["single", "multiple"],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  adType: {
    type: String,
    enum: ["banner", "bottom strip", "middle carousel", "slider", "sidebar", "pop-up"],
    default: "banner"
  },
  image: {
    type: String,
    default: "https://placehold.co/200x200?text=Category+Image"
  },
  category: {
    type: String,
    enum: ["home page", "category page", "product page", "living room", "digital safe locker", "dining room", "kitchen"],
    default: "home page"
  },
  link: {
    type: String
  },
  fromDate: {
    type: Date
  },
  toDate: {
    type: Date
  },
  ctaButton: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Ad', adSchema);
