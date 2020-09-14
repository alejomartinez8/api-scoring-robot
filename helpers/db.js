const config = require('config.json');
const mongoose = require('mongoose');

// Connections Options Mongo DB
const connectionOptions = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
};

mongoose.connect(process.env.MONGODB_URI || config.connectionString, connectionOptions);
mongoose.Promise = global.Promise;

module.exports = {
  User: require('../models/user.model'),
  Event: require('../models/event.model'),
  Challenge: require('../models/challenge.model'),
  Team: require('../models/team.model'),
  isValidId,
  convertToObjectId
};

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function convertToObjectId(id) {
  return mongoose.Types.ObjectId(id);
}
