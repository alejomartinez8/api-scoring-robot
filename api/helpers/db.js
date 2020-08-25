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
  Account: require('../models/accounts/account.model'),
  RefreshToken: require('../models/accounts/refresh-token.model'),
  isValidId
};

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}
