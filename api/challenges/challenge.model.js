const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const challengeSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  imageURL: { type: String },
  description: { type: String },
  playoffs: { type: Boolean, required: true },
  finalTeams: Number,
  categories: [{ type: String }],
  maxTeams: Number,
  maxTurns: Number,
  topMaxTurns: Number,
  bonusType: String,
  tasks: [{ order: Number, label: String, points: String, penalty: String }],
  maxTime: Number,
  taskSecuence: { type: Boolean, default: false },
  stopTime: { type: Boolean, default: false },
  available: { type: Boolean, required: true },
  created: { type: Date, default: Date.now },
  updated: Date
});

challengeSchema.static('findBySlug', function (slug) {
  return this.findOne({ slug: slug });
});

module.exports = mongoose.model('challenge', challengeSchema);
