const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teamSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'event'
  },
  challenge: {
    type: Schema.Types.ObjectId,
    ref: 'challenge'
  },
  category: {
    type: String
  },
  name: { type: String },
  institution: { type: String },
  players: [
    {
      name: { type: String },
      legalId: { type: String },
      birthday: { type: Date }
    }
  ],
  actived: { type: Boolean },
  created: { type: Date, default: Date.now },
  updated: Date
});

module.exports = mongoose.model('team', teamSchema);
