const { Router } = require('express');
const basicAuth = require('express-basic-auth');
const logger = require('../logger');
const db = require('../db');

const main = new Router();

main.use(basicAuth({
  users: { 'admin': process.env.ADMIN_PASSWD },
  challenge: true,
}));

main.get('/init', async (req, res) => {
  const auth = {
    apiKey: process.env.AUTH_KEY,
    mqttUrl: process.env.MQTT_WS_URL,
  };

  try {
    const report = await db.getReport();
    const config = await db.getHeaterConfig();
    res.json({ auth, report, config });
  } catch (err) {
    logger.error(err);
    res.status(500);
  }
});

main.get('/*', (req, res) => {
  res.render('index');
});

module.exports = main;
