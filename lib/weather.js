const request = require('request');
const logger = require('winston');

const updateInterval = 1000 * 60 * 15; // 15 minutes

let weather;
let lastUpdate = null;

async function getWeather() {
  if ((Date.now() - lastUpdate) < updateInterval) {
    return weather;
  }

  return new Promise((resolve, reject) => {
    const url = 'http://api.openweathermap.org/data/2.5/weather?id=3433955&appid=dcce4d34ff71a6bae228fc73e8980c8b&units=metric';

    logger.info('requesting weather...', url);

    request.get({ url, json: true}, (err, res, body) => {
      if (err) {
        return reject(err);
      }

      logger.debug('main weather report:', body.main);

      weather = body;
      lastUpdate = Date.now();

      resolve(weather);
    });
  });
}

exports.getWeather = getWeather;
