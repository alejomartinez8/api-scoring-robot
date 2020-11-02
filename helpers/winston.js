const appRoot = require('app-root-path');
const winston = require('winston');
require('winston-daily-rotate-file');
require('winston-mongodb');

const options = {
  file: {
    level: process.env.ENV === 'development' ? 'debug' : 'info',
    filename: `${appRoot}/logs/%DATE%-scoring-robot-app.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    timestamp: true,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    prettyPrint: true,
    json: true,
    maxsize: 5242880, // 5MB
    colorize: true
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true
  },
  database: {
    db: process.env.MONGODB_URI,
    options: { useUnifiedTopology: true },
    level: 'warn'
  }
};

const logger = new winston.createLogger({
  transports: [
    new winston.transports.DailyRotateFile(options.file),
    new winston.transports.Console(options.console),
    new winston.transports.MongoDB(options.database)
  ],
  exceptionHandlers: [new winston.transports.DailyRotateFile(options.file), new winston.transports.MongoDB(options.database)],
  exitOnError: false // do not exit on handled exceptions
});

logger.stream = {
  write: function (message, encoding) {
    logger.info(message);
  }
};

module.exports = logger;
