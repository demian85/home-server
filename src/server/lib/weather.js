const request = require('request');
const logger = require('winston');
const db = require('./db');

const expireTimeoutSecs = 60 * 15; // 15 minutes

let weatherPromise;

async function getWeather() {

  if (weatherPromise) {
    logger.debug('Returning promise...');
    return weatherPromise;
  }

  const value = await db.get('weather');

  if (value) {
    logger.debug('returning cached weather report');
    return JSON.parse(value);
  }

  weatherPromise = new Promise((resolve, reject) => {
    const url = `http://api.openweathermap.org/data/2.5/weather?id=3433955&appid=${process.env.OPENWEATHER_APP_ID}&units=metric`;

    logger.info('requesting weather...', url);

    request.get({ url, json: true}, async (err, res, body) => {
      if (err) {
        weatherPromise = null;
        return reject(err);
      }

      const weather = body;

      await db.set('weather', JSON.stringify(weather), 'EX', expireTimeoutSecs);

      logger.debug('saved updated weather report');

      weatherPromise = null;
      resolve(weather);
    });
  });

  return weatherPromise;
}

exports.getWeather = getWeather;
