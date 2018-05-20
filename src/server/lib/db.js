const redis = require('redis');
const logger = require('winston');
const { promisify } = require('util');

const db = redis.createClient(process.env.REDIS_URI);

db.on("error", function (err) {
  logger.error(err);
});

exports.set = promisify(db.set);
exports.mset = promisify(db.mset);
exports.get = promisify(db.get);

