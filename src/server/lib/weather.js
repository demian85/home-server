const request = require('request');
const { throttle } = require('lodash');
const logger = require('./logger');
const db = require('./db');

const expireTimeoutSecs = 60 * 15; // 15 minutes

async function getWeather() {

  const value = await db.get('weather');

  if (value) {
    logger.debug('returning cached weather report');
    return JSON.parse(value);
  }

  return new Promise((resolve, reject) => {
    const url = `http://api.openweathermap.org/data/2.5/weather?id=3433955&appid=${process.env.OPENWEATHER_APP_ID}&units=metric`;

    logger.info('requesting weather... %s', url);

    request.get({ url, json: true}, async (err, res, body) => {
      if (err) {
        return reject(err);
      }

      const weather = body;

      await db.set('weather', JSON.stringify(weather), 'EX', expireTimeoutSecs);

      logger.debug('saved updated weather report');

      resolve(weather);
    });
  });
}

exports.getWeather = throttle(getWeather, 1000);
