// models/Consultation.js
const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  location: String,
  category: String,
  name: String,
  mobile: String,
  whatsapp: Boolean,
  email: String,
  budget: String,
  interest: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Consultation', consultationSchema);
