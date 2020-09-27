const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scoreSchema = new Schema({
  team: { type: Schema.Types.ObjectId, ref: 'team' },
  event: { type: Schema.Types.ObjectId, ref: 'event' },
  challenge: { type: Schema.Types.ObjectId, ref: 'challenge' },
  turns: [
    {
      tasks: [Boolean],
      penalties: [Boolean],
      taskPoints: Number,
      bonusPoints: Number,
      totalPoints: Number
    }
  ]
});

module.exports = mongoose.model('score', scoreSchema);
