const mongoose = require('mongoose');
const { model } = require('./account.model');
const Schema = mongoose.Schema;

const schema = new Schema({
  account: { type: Schema.Types.ObjectId, ref: 'Account' },
  token: String,
  expires: Date,
  created: { type: Date, default: Date.now },
  createdByIp: String,
  revoked: Date,
  revokeddByIp: String,
  replacedByToken: String
});

schema.virtual('isExpired').get(() => {
  return !this.revoked && !this.isExpired;
});

module.exposts = mongoose.model('RefreshToken', schema);
