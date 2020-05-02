const { Router } = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');
const logger = require('../logger');
const db = require('../db');
const { updateHeaterState, updateReport } = require('../main');
const client = require('../mqtt/client');

const router = new Router();

router.use(
  basicAuth({
    users: { admin: process.env.ADMIN_PASSWD },
    challenge: true,
  })
);

router.get('/init', async (req, res) => {
  const auth = {
    apiKey: process.env.AUTH_KEY,
    mqttUrl: process.env.MQTT_WS_URL,
  };

  try {
    const config = await db.getHeaterConfig();
    res.json({ auth, config });
  } catch (err) {
    logger.error(err);
    res.status(500);
  }
});

router.get('/config', async (req, res) => {
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

router.post('/config', bodyParser.json(), async (req, res) => {
  const config = req.body || {};

  logger.debug('POST /config %o', config);

  const validKeys = [
    'defaultSetPoint',
    'minStateDurationSecs',
    'autoMode',
    'tempGroups',
    'trigger',
    'threshold',
    'autoTurnOffDeskLamp',
    'autoTurnOffDeskLampDelay',
    'autoTurnOnDeskLamp',
    'nightTime',
    'bedTime',
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
  const autoTurnOffDeskLamp = !!newConfig.autoTurnOffDeskLamp;
  const autoTurnOffDeskLampDelay = Number(newConfig.autoTurnOffDeskLampDelay);
  const autoTurnOnDeskLamp = !!newConfig.autoTurnOnDeskLamp;
  const nightTime = newConfig.nightTime;
  const bedTime = newConfig.bedTime;
  const threshold = newConfig.threshold;

  try {
    await db.set(
      'heater.config',
      JSON.stringify({
        defaultSetPoint,
        minStateDurationSecs,
        autoMode,
        tempGroups,
        trigger,
        threshold,
        autoTurnOffDeskLamp,
        autoTurnOffDeskLampDelay,
        autoTurnOnDeskLamp,
        nightTime,
        bedTime,
      })
    );
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

router.get('/*', (req, res) => {
  res.render('index');
});

module.exports = router;
