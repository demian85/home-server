const { Router } = require('express');
const client = require('../client');
const logger = require('winston');

const main = new Router();

main.get('/', (req, res) => {
  res.render('index');
});

const api = new Router();

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

exports.main = main;
exports.api = api;
