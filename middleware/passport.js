const db = require('../helpers/db');
const passport = require('passport');
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');

passport.use(
  new GoogleTokenStrategy(
    {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    },
    function (accessToken, refreshToken, profile, done) {
      db.User.findOneOrCreateByGoogle(profile, function (err, user) {
        if (err) console.log(err);
        return done(err, user);
      });
    }
  )
);

passport.use(
  new FacebookTokenStrategy(
    {
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET
    },
    function (accessToken, refreshToken, profile, done) {
      db.User.findOneOrCreateByFacebook(profile, function (err, user) {
        if (err) console.log(err);
        return done(err, user);
      });
    }
  )
);

passport.serializeUser(function (user, callback) {
  callback(null, user.id);
});

passport.deserializeUser(function (id, callback) {
  User.findById(id, function (err, user) {
    callback(err, user);
  });
});

module.exports = passport;
