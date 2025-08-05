const { createLogger, format, transports } = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for different log levels
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
require('winston').addColors(colors);

// Custom format for console logging
const consoleFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.colorize({ all: true }),
  format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Custom format for file logging
const fileFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(
    (info) =>
      `${info.timestamp} [${info.level.toUpperCase()}] ${info.message} ${
        info.stack ? '\n' + info.stack : ''
      }`
  )
);

// Create the logger instance
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  format: format.combine(
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'social-media-automation' },
  transports: [
    // Console transport for development
    new transports.Console({
      format: consoleFormat,
    }),
    // Error logs file transport
    new transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      format: fileFormat,
    }),
    // Combined logs file transport
    new transports.File({
      filename: path.join('logs', 'combined.log'),
      format: fileFormat,
    }),
  ],
  exitOnError: false, // Do not exit on handled exceptions
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Stream for morgan HTTP request logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

module.exports = logger;
