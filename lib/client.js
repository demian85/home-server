const mqtt = require('mqtt');
const feels = require('feels');
const logger = require('winston');
const { getHumidity } = require('./weather');
const { heater, patio } = require('./devices');

const client = mqtt.connect(process.env.CLOUDMQTT_URL);

const parsers = {

  [heater.topics.sensor]: async (payload) => {
    try {
      const data = JSON.parse(payload);
      const temperature = parseFloat(data.DS18B20.Temperature) || null;

      let humidity;
      try {
        humidity = await getHumidity();
      } catch (err) {
        logger.error('error parsing weather report:', err);
        humidity = 50;
      }

      const realFeel = feels.humidex(temperature, humidity);

      logger.info({ temperature, humidity, realFeel });

      // calculate how long the device has been in this state
      const stateDurationSecs = Math.round((Date.now() - heater.lastStateChange) / 1000);

      // keep the same state for at least 15 minutes
      if (stateDurationSecs < (60 * 15)) {
        return;
      }

      if (heater.state === 'off' && realFeel < 22) {
        logger.debug('turning device on...');
        client.publish(heater.cmnd, '1');
      }
      if (heater.state === 'on' && realFeel > 22.5) {
        logger.debug('turning device off...');
        client.publish(heater.cmnd, '0');
      }
    } catch (err) {
      logger.error('telemetry payload parsing error:', err);
    }
  },

  [heater.topics.stat]: async (payload) => {
    const state = String(payload).toLowerCase();
    heater.state = state;
    heater.lastStateChange = Date.now();
  },

  [patio.topics.stat]: async (payload) => {
    const state = String(payload).toLowerCase();
    patio.state = state;
    patio.lastStateChange = Date.now();
  }
};

client.on('connect', () => {
  logger.info('mqtt client connected');

  client.subscribe(patio.topics.stat);
  client.subscribe(heater.topics.stat);
  client.subscribe(heater.topics.sensor);

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
