const request = require('request');
const logger = require('winston');
const db = require('./db');

const expireTimeoutSecs = 60 * 15; // 15 minutes

async function getWeather() {

  const value = await db.get('weather');

  if (value) {
    logger.debug('returning cached weather report');
    return JSON.parse(value);
  }

  return new Promise((resolve, reject) => {
    const url = 'http://api.openweathermap.org/data/2.5/weather?id=3433955&appid=dcce4d34ff71a6bae228fc73e8980c8b&units=metric';

    logger.info('requesting weather...', url);

    request.get({ url, json: true}, async (err, res, body) => {
      if (err) {
        return reject(err);
      }

      const weather = body;

      logger.debug('saving weather report:', weather);

      await db.set('weather', JSON.stringify(weather), 'EX', expireTimeoutSecs);

      resolve(weather);
    });
  });
}

exports.getWeather = getWeather;
