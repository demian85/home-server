const request = require('request');
const logger = require('./logger');

exports.sendEvent = async (eventName, ...values) => {
  return new Promise((resolve, reject) => {
    const url = `https://maker.ifttt.com/trigger/${eventName}/with/key/${process.env.IFTTT_KEY}`;

    const body = values.reduce((prev, value, index) => (prev[`value${index + 1}`] = value), {});

    logger.info('sending IFTTT event: %s, body: %j', eventName, body);

    request.get({ url, json: true, body }, async (err, res, body) => {
      if (err) {
        return reject(err);
      }

      resolve(body);
    });
  });
};
