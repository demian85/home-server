const mqtt = require('mqtt');
const Feels = require('feels');
const logger = require('winston');
const { getWeather } = require('./weather');
const { heater, patio } = require('./devices');

const client = mqtt.connect(process.env.CLOUDMQTT_URL);

const parsers = {

  [heater.topics.sensor]: async (payload) => {
    const data = JSON.parse(payload);
    const temperature = parseFloat(data.SI7021.Temperature) || null;
    const humidity = parseFloat(data.SI7021.Humidity) || null;
    const triggerTemp = 21;

    if (temperature === null || humidity === null) {
      logger.error(`bad readings! skipping...`, { temperature, humidity });
      return;
    }

    const feelsLike = new Feels({
      temp: temperature,
      humidity,
      speed: 0
    }).like();
    // Round to one decimal
    const realFeel = Math.round(feelsLike * 10) / 10;

    let customReport = { triggerTemp, realFeel };

    try {
      const weather = await getWeather();
      const temperatureDiff = Math.round((temperature - weather.main.temp) * 10) / 10;
      const humidityDiff = Math.round(humidity - weather.main.humidity);
      const tempDiffStr = temperatureDiff > 0 ? `+${temperatureDiff}` : String(temperatureDiff);
      const humDiffStr = humidityDiff > 0 ? `+${humidityDiff}` : String(humidityDiff);
      Object.assign(customReport, {
        temperatureDiff: tempDiffStr,
        humidityDiff: humDiffStr,
        outside: {
          temperature: weather.main.temp,
          humidity: weather.main.humidity,
          windSpeedKmh: Math.round(weather.wind.speed / 1000 * 3600)
        }
      });
    } catch (err) {
      logger.error('error parsing weather report');
      return;
    }

    logger.info(customReport);

    client.publish(heater.topics.custom, JSON.stringify(customReport), { retain: true });

    // calculate how long the device has been in this state
    const stateDurationSecs = Math.round((Date.now() - heater.lastStateChange) / 1000);

    logger.debug(`last state change was ${stateDurationSecs} seconds ago`);

    // keep the same state for at least 15 minutes
    if (stateDurationSecs < (60 * 15)) {
      logger.debug(`skipping...`);
      return;
    }

    if (heater.state === 'off' && realFeel < triggerTemp) {
      logger.debug('turning device on...');
      client.publish(heater.cmnd, '1');
    }
    if (heater.state === 'on' && realFeel >= (triggerTemp + 0.5)) {
      logger.debug('turning device off...');
      client.publish(heater.cmnd, '0');
    }
  },

  [heater.topics.stat]: async (payload) => {
    heater.state = String(payload).toLowerCase();
    heater.lastStateChange = Date.now();
  },

  [patio.topics.stat]: async (payload) => {
    patio.state = String(payload).toLowerCase();
    patio.lastStateChange = Date.now();
  }
};

client.on('connect', () => {
  logger.info('mqtt client connected');

  client.subscribe([
    patio.topics.stat,
    heater.topics.stat,
    heater.topics.sensor
  ]);

  client.on('message', async (topic, payload) => {
    logger.debug(`message for topic "${topic}":`, payload.toString());

    const parser = parsers[topic];

    if (parser) {
      try {
        parser(payload);
      } catch (err) {
        logger.error('unexpected error parsing payload for topic', topic);
        throw err;
      }
    }
  });
});

client.on('close', () => {
  logger.info('mqtt client disconnected');
});

module.exports = client;
