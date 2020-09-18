const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  name: { type: String, unique: true, required: true },
  shortName: { type: String, unique: true, required: true },
  imageURL: { type: String },
  year: { type: Number },
  description: { type: String },

  categories: [{ type: String }],
  challenges: [{ type: Schema.Types.ObjectId, ref: 'challenge' }],
  created: { type: Date, default: Date.now },
  updated: Date
});

module.exports = mongoose.model('event', eventSchema);