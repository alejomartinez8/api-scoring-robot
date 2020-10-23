﻿const express = require('express');
require('dotenv').config({ path: __dirname + '/.env' });
const logger = require('morgan');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./middleware/error-handler');
const passport = require('./middleware/passport');

if (app.get('env') === 'production') {
  app.use(logger('combined'));
} else {
  app.use(logger('dev'));
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(passport.initialize());

// allow cors requests from any origin and with credentials
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true
  })
);

// api routes
app.use('/api/auth', require('./api/controllers/auth.controller'));
app.use('/api/users', require('./api/controllers/users.controller'));
app.use('/api/events', require('./api/controllers/events.controller'));
app.use('/api/challenges', require('./api/controllers/challenges.controller'));
app.use('/api/teams', require('./api/controllers/teams.controller'));

// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? process.env.PORT || 80 : 5050;

app.listen(port, () => {
  console.log('Server listening on port ' + port);
});
