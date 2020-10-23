const config = require('../config');
const mongoose = require('mongoose');

// Connections Options Mongo DB
const connectionOptions = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
};

mongoose
  .connect(process.env.MONGODB_URI || config.connectionString, connectionOptions)
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.error(error));

module.exports = {
  User: require('../api/models/user.model'),
  Event: require('../api/models/event.model'),
  Challenge: require('../api/models/challenge.model'),
  Team: require('../api/models/team.model'),
  isValidId,
  convertToObjectId
};

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function convertToObjectId(id) {
  return mongoose.Types.ObjectId(id);
}
