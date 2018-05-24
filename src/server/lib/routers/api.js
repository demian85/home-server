const logger = require('winston');
const bodyParser = require('body-parser');
const { Router } = require('express');
const db = require('../db');
const client = require('../mqtt/client');
const { updateHeaterState } = require('../main');

const api = new Router();

api.use(bodyParser.json());

api.use((req, res, next) => {
  const key = process.env.AUTH_KEY;
  if (req.query.key !== key && req.headers.authorization !== key) {
    res.status(401).end('Invalid auth key!');
    return;
  }
  next();
});

api.get('/event/on', (req, res) => {
  const { device } = req.query;

  logger.debug('/event/on device:', device);
  client.publish(`cmnd/${device}/POWER`, '1');

  res.end();
});

api.get('/event/off', (req, res) => {
  const { device } = req.query;

  logger.debug('/event/off device:', device);
  client.publish(`cmnd/${device}/POWER`, '0');

  res.end();
});

api.get('/report', async (req, res) => {
  logger.debug('/report');
  try {
    const report = await db.getReport();
    res.json(report);
  } catch (err) {
    logger.error(err);
    res.status(500);
  }

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
  const config = req.body.config || {};

  logger.debug('POST /config', config);

  const triggerTemp = Number(config.triggerTemp);
  const minStateDurationSecs = Number(config.minStateDurationSecs);
  const autoMode = Boolean(config.autoMode);

  try {
    await db.set('heater.config', JSON.stringify({ triggerTemp, minStateDurationSecs, autoMode }));
    await updateHeaterState(client);
    res.json(await db.getHeaterConfig());
  } catch (err) {
    logger.error(err);
    res.status(500);
  }

  res.end();
});

module.exports = api;