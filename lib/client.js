const mqtt = require('mqtt');
const feels = require('feels');
const logger = require('winston');
const { getWeather } = require('./weather');
const { heater, patio } = require('./devices');

const client = mqtt.connect(process.env.CLOUDMQTT_URL);

const parsers = {

  [heater.topics.sensor]: async (payload) => {
    try {
      const data = JSON.parse(payload);
      const temperature = parseFloat(data.SI7021.Temperature) || null;
      const humidity = parseFloat(data.SI7021.Humidity) || null;

      if (temperature === null || humidity === null) {
        logger.error(`bad readings! skipping...`, { temperature, humidity });
        return;
      }

      // Australian Apparent Temperature fixed to one decimal
      const realFeel = Math.round(feels.AAT(temperature, 0, humidity) * 10) / 10;

      let weather;
      let customReport = { realFeel };

      try {
        weather = await getWeather();
        customReport.outside = {
          temperature: weather.main.temp,
          humidity: weather.main.humidity,
          windSpeed: weather.wind.speed,
        },
        customReport.temperatureDiff = Math.round((temperature - weather.main.temp) * 10) / 10;
        customReport.humidityDiff = Math.round(humidity - weather.main.humidity);
      } catch (err) {
        logger.error('error parsing weather report:', err);
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

      if (heater.state === 'off' && realFeel < 20) {
        logger.debug('turning device on...');
        client.publish(heater.cmnd, '1');
      }
      if (heater.state === 'on' && realFeel >= 20.5) {
        logger.debug('turning device off...');
        client.publish(heater.cmnd, '0');
      }
    } catch (err) {
      logger.error('telemetry payload parsing error:', err);
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
      parser(payload);
    }
  });
});

client.on('close', () => {
  logger.info('mqtt client disconnected');
});

module.exports = client;
