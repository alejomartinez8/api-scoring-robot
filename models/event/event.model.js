const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  name: { type: String, unique: true, required: true },
  shortName: { type: String, unique: true, required: true },
  imageUrl: { type: String },
  year: { type: Number },
  description: { type: String },
  created: { type: Date, default: Date.now },
  updated: Date
});

module.exports = mongoose.model('event', eventSchema);