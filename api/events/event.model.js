const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  name: { type: String, unique: true, required: true },
  slug: { type: String, unique: true, required: true },
  imageURL: { type: String },
  year: { type: Number },
  description: { type: String },
  categories: [{ type: String }],
  challenges: [{ type: Schema.Types.ObjectId, ref: 'challenge' }],
  stage: { type: String, default: 'registration' },
  active: { type: Boolean, default: true },
  maxPlayersTeam: { type: Number, default: 1 },
  minPlayersTeam: { type: Number, default: 1 },
  created: { type: Date, default: Date.now },
  updated: Date
});

module.exports = mongoose.model('event', eventSchema);
