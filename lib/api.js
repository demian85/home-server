const { Router } = require('express');
const client = require('./client');
const logger = require('winston');

const router = new Router();

router.use((req, res, next) => {
  if (req.query.key !== process.env.AUTH_KEY) {
    res.status(401).end('Invalid auth key!');
    return;
  }
  next();
});

router.get('/event/on', (req, res) => {
  const { device } = req.query;

  logger.debug('/event/on device:', device);
  client.publish(`cmnd/${device}/POWER`, '1');

  res.end();
});

router.get('/event/off', (req, res) => {
  const { device } = req.query;

  logger.debug('/event/off device:', device);
  client.publish(`cmnd/${device}/POWER`, '0');

  res.end();
});

module.exports = router;
