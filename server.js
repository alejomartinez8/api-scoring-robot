require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./middleware/error-handler');

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
app.use('/api/auth', require('./controllers/auth.controller'));
app.use('/api/users', require('./controllers/users.controller'));
app.use('/api/events', require('./controllers/events.controller'));
app.use('/api/challenges', require('./controllers/challenges.controller'));
app.use('/api/teams', require('./controllers/teams.controller'));

// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? process.env.PORT || 80 : 5050;

app.listen(port, () => {
  console.log('Server listening on port ' + port);
});
