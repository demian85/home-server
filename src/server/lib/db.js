const redis = require('redis');
const logger = require('winston');
const { promisify } = require('util');
const defaultConfig = require('../config');

const db = redis.createClient(process.env.REDIS_URI);

db.on('connect', function () {
  logger.info('redis client connected');
});

db.on('error', function (err) {
  logger.error(err);
});

exports.set = promisify(db.set.bind(db));
exports.mset = promisify(db.mset.bind(db));
exports.get = promisify(db.get.bind(db));
exports.mget = promisify(db.mget.bind(db));

exports.end = promisify(db.end.bind(db));

exports.getSensorData = async (deviceName) => {
  const value = await exports.get(`${deviceName}.sensor`);
  return value && JSON.parse(value);
};

exports.getHeaterState = async () => {
  const value = await exports.get('heater.state');
  return value && JSON.parse(value);
};

exports.getHeaterConfig = async () => {
  const value = await exports.get('heater.config');
  const config = value && JSON.parse(value);
  if (!config) return defaultConfig;
  return Object.assign({}, defaultConfig, config || {});
};

exports.getReport = async () => {
  const value = await exports.get('report');
  return value && JSON.parse(value);
};


