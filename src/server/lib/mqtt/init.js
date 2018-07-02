const logger = require('winston');

const topics = require('./topics');
const client = require('./client');
const parsers = require('./parsers');

logger.info('initializing mqtt client...');

client.on('connect', () => {
  logger.info('mqtt client connected');

  client.subscribe([
    topics.heater.stat,
    topics.heater.sensor,
    topics.wemos1.cmnd,
    topics.wemos1.sensor,
    topics.wemos1.result,
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
