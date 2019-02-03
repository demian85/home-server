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
  const nodemcuSensor = await db.getSensorData('nodemcu1');
  let cmnd = '[z]';

  if (heaterSensor) {
    cmnd += `[s2l1c1]R: ${heaterSensor.temperature} C`;
  }

  if (loungeSensor && loungeSensor.AM2301) {
    cmnd += `[s2l2c1]L: ${loungeSensor.AM2301.temperature} C`;
  }

  try {
    const weather = await getWeather();
    const outsideTemp = Math.round(weather.main.temp * 10) / 10;
    cmnd += `[s2l3c1]P: ${outsideTemp} C`;
  } catch (err) {
    logger.error('error parsing weather report: %o', err);
  }

  if (nodemcuSensor && nodemcuSensor.MQ135) {
    cmnd += `[s2l4c1]Air Q: ${nodemcuSensor.MQ135.airQuality}%`;
  }

  mqttClient.publish(topics.wemos1.cmnd('DisplayText'), cmnd);
};

exports.clearDisplay = async function() {
  logger.debug(`clearDisplay()`);

  mqttClient.publish(topics.wemos1.cmnd('DisplayText'), '[z]');
};
