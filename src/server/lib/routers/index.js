const logger = require('winston');
const bodyParser = require('body-parser');
const { Router } = require('express');
const db = require('../db');
const client = require('../client');

const main = new Router();

main.get('/', (req, res) => {
  res.render('index');
});

const api = new Router();

api.use(bodyParser.json());

api.use((req, res, next) => {
  if (req.query.key !== process.env.AUTH_KEY) {
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
  try {
    const report = await db.get('report');
    res.json(report);
  } catch (err) {
    logger.error(err);
    res.status(500);
  }

  res.end();
});

api.post('/config', async (req, res) => {
  const { triggerTemp, presence, auto } = req.body.config;

  try {
    await db.mset([
      'triggerTemp', triggerTemp,
      'presence', presence,
      'auto', auto,
    ]);
  } catch (err) {
    logger.error(err);
    res.status(500);
  }

  res.end();
});

exports.main = main;
exports.api = api;
