const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  content: String,
  updatedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
});

const policySchema = new mongoose.Schema({
  title: { type: String, enum: ['terms', 'warranty', 'shipping'], required: true, unique: true },
  versions: [versionSchema],
});

module.exports = mongoose.model('Policy', policySchema);