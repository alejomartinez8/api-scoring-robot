const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  name: { type: String, unique: true, required: true },
  shortName: { type: String, unique: true, required: true },
  imageURL: { type: String },
  year: { type: Number },
  description: { type: String },
  challeges: [
    {
      name: { type: String, required: true },
      teamMax: { type: Number },
      turnMax: { type: Number }
    }
  ],
  created: { type: Date, default: Date.now },
  updated: Date
});

module.exports = mongoose.model('event', eventSchema);
