const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teamSchema = new Schema({
  user: {
    _id: { type: Schema.Types.ObjectId, ref: 'user' },
    fullName: String,
    institution: String,
    city: String,
    country: String
  },
  event: {
    _id: { type: Schema.Types.ObjectId, ref: 'event' },
    slug: String,
    name: String
  },
  challenge: {
    _id: { type: Schema.Types.ObjectId, ref: 'challenge' },
    name: String,
    slug: String
  },
  category: String,
  name: String,
  institution: String,
  players: [
    {
      name: String,
      legalId: String,
      birthday: Date
    }
  ],
  turns: [
    {
      tasks: [Boolean],
      penalties: [Boolean],
      taskPoints: Number,
      bonusPoints: Number,
      totalPoints: Number
    }
  ],
  actived: Boolean,
  created: { type: Date, default: Date.now },
  updated: Date
});

module.exports = mongoose.model('team', teamSchema);
