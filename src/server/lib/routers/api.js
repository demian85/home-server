const { Router } = require('express');
const logger = require('../logger');
const client = require('../mqtt/client');

const router = new Router();

router.use((req, res, next) => {
  const key = process.env.AUTH_KEY;
  if (req.query.key !== key && req.headers.authorization !== key) {
    res.status(401).end('Invalid auth key!');
    return;
  }
  next();
});

router.get('/event/on', (req, res) => {
  const { device } = req.query;

  logger.debug('/event/on device: %s', device);
  client.publish(`cmnd/${device}/POWER`, '1');

  res.end();
});

router.get('/event/off', (req, res) => {
  const { device } = req.query;

  logger.debug('/event/off device: %s', device);
  client.publish(`cmnd/${device}/POWER`, '0');

  res.end();
});

router.get('/event/toggle', (req, res) => {
  const { device } = req.query;

  logger.debug('/event/toggle device: %s', device);
  client.publish(`cmnd/${device}/TOGGLE`);

  res.end();
});

module.exports = router;
