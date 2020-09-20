const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const challengeSchema = new Schema({
  name: { type: String, required: true },
  version: { type: String, required: true, unique: true },
  imageURL: { type: String },
  description: { type: String },
  categories: [{ type: String }],
  available: { type: Boolean, required: true },
  created: { type: Date, default: Date.now },
  updated: Date
});

module.exports = mongoose.model('challenge', challengeSchema);
