const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  institution: { type: String },
  city: { type: String },
  country: { type: String },
  bio: { type: String },
  social: {
    youtube: { type: String },
    twitter: { type: String },
    facebook: { type: String },
    linkedin: { type: String },
    instagram: { type: String },
    github: { type: String }
  },
  acceptTerms: Boolean,
  role: { type: String, required: true },
  verificationToken: String,
  verified: Date,
  resetToken: { token: String, expires: Date },
  passwordReset: Date,
  created: { type: Date, default: Date.now },
  updated: Date
});

userSchema.virtual('isVerified').get(function () {
  return !!(this.verified || this.passwordReset);
});

// userSchema.virtual('isVerified').get(() => {
//   return !!(this.verified || this.passwordReset);
// });

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
    delete ret.passwordHash;
  }
});

module.exports = mongoose.model('user', userSchema);
