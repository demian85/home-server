const db = require('./db');
const logger = require('./logger');
const mqttClient = require('./mqtt/client');
const topics = require('./mqtt/topics');
const { getWeather } = require('./weather');

exports.updateDisplay = async function() {
  const { enableOledDisplay } = await db.getHeaterConfig();

  logger.debug(`updateDisplay(): %j`, { enableOledDisplay });

  if (!enableOledDisplay) {
    return;
  }

  const heaterSensor = await db.getSensorData('heater1');
  const loungeSensor = await db.getSensorData('wemos1');
  let cmnd = `[z][f1l1c1]Room temp: ${heaterSensor.temperature} C [f1l3c1]Living temp: ${
    loungeSensor.AM2301.temperature
  } C`;

  try {
    const weather = await getWeather();
    const outsideTemp = Math.round(weather.main.temp * 10) / 10;
    cmnd += ` [f1l5c1]Outside: ${outsideTemp} C`;
  } catch (err) {
    logger.error('error parsing weather report: %o', err);
  }

  mqttClient.publish(topics.wemos1.cmnd('DisplayText'), cmnd);
};

exports.clearDisplay = async function() {
  logger.debug(`clearDisplay()`);

  mqttClient.publish(topics.wemos1.cmnd('DisplayText'), '[z]');
};
