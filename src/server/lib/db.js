const redis = require('redis');
const logger = require('./logger');
const { promisify } = require('util');
const defaultConfig = require('../config');

const db = redis.createClient(process.env.REDIS_URI);

db.on('connect', function () {
  logger.info('redis client connected');
});

db.on('error', function (err) {
  logger.error('redis client error', err);
});

exports.set = promisify(db.set.bind(db));
exports.mset = promisify(db.mset.bind(db));
exports.get = promisify(db.get.bind(db));
exports.mget = promisify(db.mget.bind(db));
exports.end = promisify(db.end.bind(db));

exports.getSensorData = async (deviceName) => {
  const value = await exports.get(`${deviceName}.sensor`);
  return value ? JSON.parse(value) : null;
};

exports.setSensorData = async (deviceName, value) => {
  await exports.set(`${deviceName}.sensor`, JSON.stringify(value));
};

exports.getDeviceState = async (deviceName) => {
  const value = await exports.get(`${deviceName}.state`);
  return value ? JSON.parse(value) : null;
};

exports.getDeviceOnlineStatus = async (deviceName) => {
  const value = await exports.get(`${deviceName}.online`);
  return value ? JSON.parse(value) : null;
};

exports.getConfig = async () => {
  const value = await exports.get('config');
  const config = value ? JSON.parse(value) : {};
  return { ...defaultConfig, ...config };
};

exports.getReport = async () => {
  const value = await exports.get('report');
  return value ? JSON.parse(value) : null;
};
