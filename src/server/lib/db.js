const redis = require('redis');
const logger = require('winston');
const { promisify } = require('util');

const db = redis.createClient(process.env.REDIS_URI);

db.on("error", function (err) {
  logger.error(err);
});

exports.set = promisify(db.set.bind(db));
exports.mset = promisify(db.mset.bind(db));
exports.get = promisify(db.get.bind(db));
exports.mget = promisify(db.mget.bind(db));

// exports.hset = promisify(db.hset.bind(db));
// exports.hmset = promisify(db.hmset.bind(db));
// exports.hget = promisify(db.hget.bind(db));
// exports.hmget = promisify(db.hmget.bind(db));
// exports.hgetall = promisify(db.hgetall.bind(db));

exports.getHeaterSensor = async () => {
  const value = await exports.get('heater.sensor');
  return value && JSON.parse(value);
};

exports.getHeaterState = async () => {
  const value = await exports.get('heater.state');
  return value && JSON.parse(value);
};

exports.getHeaterConfig = async () => {
  const defaults = {
    triggerTemp: 22,
    minStateDurationSecs: 60 * 15,
    autoMode: false
  };
  const value = await exports.get('heater.config');
  return value ? Object.assign(defaults, JSON.parse(value)) : defaults;
};


