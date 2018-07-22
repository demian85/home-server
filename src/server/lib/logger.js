const { DateTime } = require('luxon');
const { createLogger, format, transports } = require('winston');
const { combine, printf, splat } = format;

const myFormat = printf((info) => {
  const dateString = DateTime.local().toFormat('yyyy-LL-dd HH:mm:ss');
  return `${dateString} [${info.level}]: ${info.message}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(splat(), myFormat),
  transports: [new transports.Console()]
});

module.exports = logger;
