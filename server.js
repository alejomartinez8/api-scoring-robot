const express = require('express');
require('dotenv').config({ path: __dirname + '/.env' });
const logger = require('morgan');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./middleware/error-handler');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// allow cors requests from any origin and with credentials
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true
  })
);

// api routes
app.use('/api/auth', require('./api/auth/auth.controller'));
app.use('/api/users', require('./api/users/users.controller'));
app.use('/api/events', require('./api/events/events.controller'));
app.use('/api/challenges', require('./api/challenges/challenges.controller'));
app.use('/api/teams', require('./api/teams/teams.controller'));

// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? process.env.PORT || 80 : 5050;

app.listen(port, () => {
  console.log('Server listening on port ' + port);
});
