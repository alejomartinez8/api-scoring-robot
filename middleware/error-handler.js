const winston = require('../helpers/winston');

module.exports = errorHandler;

function errorHandler(err, req, res, next) {
  // console.log('errorHandler', err);
  winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  switch (true) {
    case typeof err === 'string':
      // custom application error
      const is404 = err.toLowerCase().endsWith('not found');
      const statusCode = is404 ? 404 : 400;
      return res.status(statusCode).json({ message: err });
    case err.name === 'ValidationError':
      // mongoose validation error
      return res.status(400).json({ message: err.message });
    case err.name === 'UnauthorizedError':
      // jwt authentication error
      return res.status(401).json({ message: 'Unauthorized' });
    case err.errors.length > 0:
      return res.status(400).json({ message: err.errors.map((elm) => elm.msg) });
    default:
      return res.status(500).json({ message: err.message });
  }
}
