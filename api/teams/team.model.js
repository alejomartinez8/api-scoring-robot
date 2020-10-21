const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teamSchema = new Schema({
  // user: { type: Schema.Types.ObjectId, ref: 'user' },
  event: { type: Schema.Types.ObjectId, ref: 'event' },
  challenge: { type: Schema.Types.ObjectId, ref: 'challenge' },
  category: String,
  name: String,
  institution: String,
  players: [{ name: String, legalId: String, birthday: { type: Date } }],
  turns: [
    {
      tasks: [Boolean],
      penalties: [Boolean],
      taskPoints: Number,
      bonusPoints: Number,
      totalPoints: Number
    }
  ],
  registered: Boolean,
  created: { type: Date, default: Date.now },
  updated: Date
});

teamSchema.virtual('turnCounter').get(function () {
  return this.turns.length;
});

teamSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('team', teamSchema);
