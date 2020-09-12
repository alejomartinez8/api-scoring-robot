const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teamSchema = new Schema({
  coach: { type: String },
  name: { type: String },
  number: { type: String },
  category: { type: String },
  institution: { type: String },
  players: [
    {
      name: { type: String },
      legalId: { type: String },
      birthday: { type: Date }
    }
  ],
  created: { type: Date, default: Date.now },
  updated: Date
});

module.exports = mongoose.model('team', teamSchema);
