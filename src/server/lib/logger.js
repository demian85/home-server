const { DateTime } = require('luxon');
const { createLogger, format, transports } = require('winston');
const { Writable } = require('stream');
const mqttClient = require('./mqtt/client');

const { combine, printf, splat } = format;

const myFormat = printf((info) => {
  const dateString = DateTime.local().toFormat('yyyy-LL-dd HH:mm:ss');
  return `${dateString} [${info.level}]: ${info.message}`;
});

class MqttStream extends Writable {
  constructor(options) {
    super(options);
    this.mqttClient = mqttClient;
  }

  _write(obj, encoding, callback) {
    const { level, message } = obj;
    this.mqttClient.publish('stat/_logs', JSON.stringify({ level, message }), { qos: 0 });
    callback();
  }
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(splat(), myFormat),
  transports: [
    new transports.Console(),
    new transports.Stream({
      stream: new MqttStream({ objectMode: true }),
      level: 'debug',
    }),
  ],
});

module.exports = logger;
