const request = require('request');

const updateInterval = 1000*60*5; // 5 minutes
let humidity;
let lastUpdate = null;

async function getWeather() {
  if ((Date.now() - lastUpdate) < updateInterval) {
    return humidity;
  }
  return new Promise((resolve, reject) => {
    const url = 'http://api.openweathermap.org/data/2.5/weather?id=3433955&appid=dcce4d34ff71a6bae228fc73e8980c8b&units=metric';

    console.log('requesting weather...', url);

    request.get({ url, json: true}, (err, res, body) => {
      if (err) {
        return reject(err);
      }

      console.log('weather report:', body);
      humidity = body.main.humidity;
      lastUpdate = Date.now();

      resolve(humidity);
    });
  });
}

exports.getWeather = getWeather;
