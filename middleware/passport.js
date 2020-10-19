const db = require('../helpers/db');
const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');

passport.use(
  new FacebookTokenStrategy(
    {
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET
    },
    function (accessToken, refreshToken, profile, done) {
      try {
        db.User.findOneOrCreateByFacebook(profile, function (err, user) {
          if (err) console.log(err);
          return done(err, user);
        });
      } catch (err2) {
        console.log(err2);
        return done(err2, user);
      }
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
