const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const challengeSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  imageURL: { type: String },
  description: { type: String },
  playoffs: { type: Boolean, required: true },
  categories: [{ type: String }],
  maxTeams: Number,
  maxTurns: Number,
  topMaxTurns: Number,
  bonusType: String,
  tasks: [
    {
      label: { type: String },
      points: { type: Number },
      penalty: { type: Number }
    }
  ],
  maxTime: Number,
  taskSecuence: { type: Boolean },
  available: { type: Boolean, required: true },
  created: { type: Date, default: Date.now },
  updated: Date
});

challengeSchema.static('findBySlug', function (slug) {
  return this.findOne({ slug: slug });
});

module.exports = mongoose.model('challenge', challengeSchema);
