const { Router } = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');
const logger = require('../logger');
const db = require('../db');
const { updateRoomHeating, updateReport } = require('../main');
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
    const config = await db.getConfig();
    res.json({ auth, config });
  } catch (err) {
    logger.error(err);
    res.status(500);
  }
});

router.get('/config', async (req, res) => {
  logger.debug('GET /config');

  try {
    const config = await db.getConfig();
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
    'autoTurnOffDeskLamp',
    'autoTurnOffDeskLampDelay',
    'autoTurnOnDeskLamp',
    'bedTime',
    'minStateDurationSecs',
    'nightTime',
    'rooms',
  ];
  const newConfig = {};

  Object.keys(config).forEach((key) => {
    if (validKeys.includes(key)) {
      newConfig[key] = config[key];
    }
  });

  if (isNaN(newConfig.minStateDurationSecs)) {
    res.status(400).end();
  }

  const minStateDurationSecs = Number(newConfig.minStateDurationSecs || 300);
  const autoTurnOffDeskLamp = !!newConfig.autoTurnOffDeskLamp;
  const autoTurnOffDeskLampDelay = Number(newConfig.autoTurnOffDeskLampDelay);
  const autoTurnOnDeskLamp = !!newConfig.autoTurnOnDeskLamp;
  const nightTime = newConfig.nightTime;
  const bedTime = newConfig.bedTime;

  const outputConfig = {
    ...newConfig,
    autoTurnOffDeskLamp,
    autoTurnOffDeskLampDelay,
    autoTurnOnDeskLamp,
    bedTime,
    minStateDurationSecs,
    nightTime,
  };
  const jsonConfig = JSON.stringify(outputConfig);

  client.publish('stat/_config', jsonConfig);

  try {
    await db.set('config', jsonConfig);
    await updateReport();
    res.json(outputConfig);
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
