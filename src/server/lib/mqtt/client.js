const mqtt = require('mqtt');
const logger = require('winston');
const topics = require('./topics');
const db = require('../db');
const { updateHeaterState, updateReport } = require('../main');

const parsers = {

  'config/heater_auto': async (payload) => {
    const autoMode = String(payload) === '1';
    const defaultConfig = await db.getHeaterConfig();
    const newConfig = Object.assign(defaultConfig, { autoMode });
    logger.debug('Config change:', newConfig);
    await db.set('heater.config', JSON.stringify(newConfig));
  },

  [topics.heater.stat]: async (payload) => {
    const on = String(payload).toLowerCase() === 'on';
    const lastChange = Date.now();
    logger.debug('Saving state data:', { on, lastChange });
    await db.set('heater.state', JSON.stringify({ on, lastChange }));
  },

  [topics.heater.sensor]: async (payload) => {
    const data = JSON.parse(payload);
    const temperature = parseFloat(data.SI7021.Temperature) || null; // can't be 0, sorry!
    const humidity = parseFloat(data.SI7021.Humidity) || null; // 0% humidity would be nice!

    const { autoMode } = await db.getHeaterConfig();

    logger.debug('Saving sensor data:', { temperature, humidity });

    await db.set('heater.sensor', JSON.stringify({ temperature, humidity }));

    if (autoMode) {
      await updateHeaterState(client);
    }

    await updateReport(client);
  }
};

const client = initMqttClient();

function initMqttClient() {
  logger.info('initializing mqtt client...');

  const client = mqtt.connect(process.env.CLOUDMQTT_URL);

  client.on('connect', () => {
    logger.info('mqtt client connected');

    client.subscribe([
      'config/heater_auto',
      topics.heater.stat,
      topics.heater.sensor
    ]);
  });

  client.on('message', async (topic, payload) => {
    logger.debug(`message for topic "${topic}":`, payload.toString());

    const parser = parsers[topic];

    if (parser) {
      try {
        await parser(payload);
      } catch (err) {
        logger.error('unexpected error parsing payload for topic', topic);
        throw err;
      }
    }
  });

  client.on('close', () => {
    logger.info('mqtt client disconnected');
  });

  client.on('error', (err) => {
    logger.error('mqtt client error:', err);
  });

  return client;
}

module.exports = client;
