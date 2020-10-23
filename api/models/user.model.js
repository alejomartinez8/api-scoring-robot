const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, unique: true, required: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, required: true },
  institution: { type: String },
  city: { type: String },
  country: { type: String },
  bio: { type: String },
  teams: [{ type: Schema.Types.ObjectId, ref: 'team' }],
  isActive: Boolean,
  acceptTerms: Boolean,
  verificationToken: String,
  verified: Date,
  resetToken: { token: String, expires: Date },
  passwordReset: Date,
  googleId: String,
  facebookId: String,
  created: { type: Date, default: Date.now },
  updated: Date
});

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // delete these props when object is serialized
    // delete ret._id;
    delete ret.passwordHash;
  },
  id: false
});

userSchema.virtual('isVerified').get(function () {
  return !!(this.verified || this.passwordReset);
});

userSchema.virtual('fullName').get(function () {
  return this.firstName + ' ' + this.lastName;
});

userSchema.statics.findOneOrCreateByGoogle = function findOneOrCreate(profile, callback) {
  const self = this;
  // console.log('findOneOrCreateByGoogle: ', profile);
  self.findOne(
    {
      $or: [{ facebookId: profile.id }, { email: profile.emails[0].value }]
    },
    function (err, result) {
      if (result !== null) {
        callback(err, result); // if exist on mongoDB
      } else {
        let newUser = {};
        newUser.googleId = profile.id;
        newUser.firstName = profile._json.given_name || 'No firstName';
        newUser.lastName = profile._json.family_name || 'No lastName';
        newUser.email = profile._json.email;
        newUser.role = 'User';
        newUser.verified = Date.now();
        newUser.passwordHash = crypto.randomBytes(16).toString('hex');
        self.create(newUser, (err, res) => {
          if (err) {
            console.error(err);
          }
          callback(err, res);
        });
      }
    }
  );
};

userSchema.statics.findOneOrCreateByFacebook = function findOneOrCreate(profile, callback) {
  const self = this;
  // console.log('findOneOrCreateByFacebook: ', profile);
  self.findOne(
    {
      $or: [{ facebookId: profile.id }, { email: profile.emails[0].value }]
    },
    function (err, result) {
      // console.log('findOne: err,result', err, result);
      if (result !== null) {
        callback(err, result); // if exist on mongoDB
      } else {
        let newUser = {};
        newUser.facebookId = profile.id;
        newUser.firstName = profile._json.first_name || 'No firstName';
        newUser.lastName = profile._json.last_name || 'No lastName';
        newUser.email = profile._json.email;
        newUser.role = 'User';
        newUser.verified = Date.now();
        newUser.passwordHash = crypto.randomBytes(16).toString('hex');
        self.create(newUser, (err, res) => {
          if (err) {
            console.error(err);
          }
          callback(err, res);
        });
      }
    }
  );
};

module.exports = mongoose.model('user', userSchema);
