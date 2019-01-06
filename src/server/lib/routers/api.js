const bodyParser = require('body-parser');
const { Router } = require('express');
const basicAuth = require('express-basic-auth');
const logger = require('../logger');
const db = require('../db');
const client = require('../mqtt/client');
const { updateHeaterState, updateReport } = require('../main');

const api = new Router();

api.use(basicAuth({
  users: { 'admin': process.env.ADMIN_PASSWD },
  challenge: true,
}));

api.use(bodyParser.json());

// api.use((req, res, next) => {
//   const key = process.env.AUTH_KEY;
//   if (req.query.key !== key && req.headers.authorization !== key) {
//     res.status(401).end('Invalid auth key!');
//     return;
//   }
//   next();
// });

api.get('/event/on', (req, res) => {
  const { device } = req.query;

  logger.debug('/event/on device: %s', device);
  client.publish(`cmnd/${device}/POWER`, '1');

  res.end();
});

api.get('/event/off', (req, res) => {
  const { device } = req.query;

  logger.debug('/event/off device: %s', device);
  client.publish(`cmnd/${device}/POWER`, '0');

  res.end();
});

api.get('/config', async (req, res) => {
  logger.debug('GET /config');

  try {
    const config = await db.getHeaterConfig();
    res.json(config);
  } catch (err) {
    logger.error(err);
    res.status(500);
  }

  res.end();
});

api.post('/config', async (req, res) => {
  const config = req.body || {};

  logger.debug('POST /config %o', config);

  const validKeys = [
    'defaultSetPoint',
    'minStateDurationSecs',
    'autoMode',
    'tempGroups',
    'trigger', 'autoLedPower',
    'autoTurnOffDeskLamp',
    'autoTurnOnDeskLamp',
  ];
  const newConfig = {};

  Object.keys(config).forEach((key) => {
    if (validKeys.includes(key)) {
      newConfig[key] = config[key];
    }
  });

  if (isNaN(newConfig.defaultSetPoint)) {
    res.status(400).end();
  }
  if (isNaN(newConfig.minStateDurationSecs)) {
    res.status(400).end();
  }
  if (!['temp', 'feel'].includes(newConfig.trigger)) {
    res.status(400).end();
  }

  const defaultSetPoint = Number(newConfig.defaultSetPoint);
  const minStateDurationSecs = Number(newConfig.minStateDurationSecs);
  const autoMode = Boolean(newConfig.autoMode);
  const tempGroups = newConfig.tempGroups || [];
  const trigger = newConfig.trigger;
  const autoLedPower = newConfig.autoLedPower;
  const autoTurnOffDeskLamp = !!newConfig.autoTurnOffDeskLamp;
  const autoTurnOnDeskLamp = !!newConfig.autoTurnOnDeskLamp;

  try {
    await db.set('heater.config', JSON.stringify({
      defaultSetPoint,
      minStateDurationSecs,
      autoMode,
      tempGroups,
      trigger,
      autoLedPower,
      autoTurnOffDeskLamp,
      autoTurnOnDeskLamp,
    }));
    const newConfig = await db.getHeaterConfig();
    if (autoMode) {
      await updateHeaterState();
    }
    await updateReport();
    client.publish('stat/_config', JSON.stringify(newConfig));
    res.json(newConfig);
  } catch (err) {
    logger.error(err);
    res.status(500);
  }

  res.end();
});

module.exports = api;
