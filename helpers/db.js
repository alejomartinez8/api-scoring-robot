const mongoose = require('mongoose');

// Connections Options Mongo DB
const connectionOptions = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
};

mongoose
  .connect(process.env.MONGODB_URI, connectionOptions)
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.error(error));

module.exports = {
  User: require('../api/auth/user.model'),
  Event: require('../api/events/event.model'),
  Challenge: require('../api/challenges/challenge.model'),
  Team: require('../api/teams/team.model'),
  isValidId,
  convertToObjectId
};

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function convertToObjectId(id) {
  return mongoose.Types.ObjectId(id);
}
