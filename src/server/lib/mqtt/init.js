const logger = require('../logger');
const client = require('./client');
const parsers = require('./parsers');

logger.info('initializing mqtt client...');

client.on('connect', () => {
  logger.info('mqtt client connected');

  client.subscribe([
    'stat/+/POWER',
    'stat/+/RESULT',
    'stat/+/SWITCH1',
    'stat/+/SWITCH2',
    'stat/+/SWITCH3',
    'cmnd/+/POWER',
    'tele/+/SENSOR',
    'tele/+/STATE',
    'tele/+/RESULT',
    'tele/+/LWT',
    'shellies/+/online',
  ]);
});

client.on('message', async (topic, payload) => {
  logger.debug('message received', { topic, payload: payload.toString() });

  const parser = parsers[topic];

  if (parser) {
    try {
      await parser(payload);
    } catch (err) {
      logger.error('unexpected error executing parser for topic', {
        topic,
        err,
      });
      console.error(err);
    }
  } else {
    const shelliesMatch = topic.match(/^shellies\/(.+?)\/online$/);
    if (shelliesMatch) {
      client.publish(`shellies/${shelliesMatch[1]}/online_retained`, payload, {
        retain: true,
      });
    }
  }
});

client.on('close', () => {
  logger.info('mqtt client disconnected');
});

client.on('error', (err) => {
  logger.error('mqtt client error: %o', err);
});

return client;
