const { Router } = require('express');
const logger = require('../logger');
const client = require('../mqtt/client');
const { getDevicePowerStateFromPayload } = require('../utils');

const router = new Router();

router.use((req, res, next) => {
  const key = process.env.AUTH_KEY;
  const clientKey = req.headers.authorization || req.query.key;
  if (clientKey !== key) {
    res.status(401).end('Invalid auth key!');
    return;
  }
  next();
});

router.get('/event/on', (req, res) => {
  const { device } = req.query;

  logger.info('/event/on device: %s', device);
  client.publish(`cmnd/${device}/POWER`, '1');

  res.end();
});

router.get('/event/off', (req, res) => {
  const { device } = req.query;

  logger.info('/event/off device: %s', device);
  client.publish(`cmnd/${device}/POWER`, '0');

  res.end();
});

router.get('/event/toggle', (req, res) => {
  const { device } = req.query;

  logger.info('/event/toggle device: %s', device);
  client.publish(`cmnd/${device}/POWER`, 'TOGGLE');

  res.end();
});

router.get('/state', (req, res) => {
  const { device, power } = req.query;
  const isOn = getDevicePowerStateFromPayload(power);

  if (!device) {
    res.status(400).end('Invalid device name!');
    return;
  }

  logger.info('/state device: %s, isOn: %s', device, isOn);
  client.publish(`stat/${device}/POWER`, '1');

  res.end();
});

module.exports = router;
