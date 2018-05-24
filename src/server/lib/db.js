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

exports.getHeaterSensor = async () => {
  const value = await exports.get('heater.sensor');
  return value && JSON.parse(value);
};

exports.getHeaterState = async () => {
  const value = await exports.get('heater.state');
  return value && JSON.parse(value);
};

exports.getHeaterConfig = async () => {
  // const value = await exports.get('heater.config');
  // return value && JSON.parse(value);
  return defaultConfig;
};

exports.getReport = async () => {
  const value = await exports.get('report');
  return value && JSON.parse(value);
};


