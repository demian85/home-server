const db = require('./db');
const logger = require('./logger');
const mqttClient = require('./mqtt/client');
const topics = require('./mqtt/topics');
const { isNightTime, isBedTime, getMotionSensorState, getRoomSetPoint } = require('./utils');

// turn off desk lamp N minutes after motion sensor goes off
exports.turnOffDeskLampIfNeeded = async function() {
  const { autoTurnOffDeskLamp, autoTurnOffDeskLampDelay } = await db.getHeaterConfig();
  const motionSensorState = await getMotionSensorState();
  const bedTime = await isBedTime();

  logger.debug(`turnOffDeskLampIfNeeded(): %j`, { autoTurnOffDeskLamp, motionSensorState, isBedTime: bedTime });

  if (autoTurnOffDeskLamp && motionSensorState) {
    const motionSensorLastStateChangeDiff = Date.now() - motionSensorState.lastChange;
    if (
      bedTime &&
      motionSensorState.on === false &&
      motionSensorLastStateChangeDiff > 1000 * autoTurnOffDeskLampDelay
    ) {
      logger.info('switching off device: deskLamp');
      mqttClient.publish(topics.deskLamp.cmnd(), '0');
    }
  }
};

// turn on desk lamp during night time when motion sensor goes ON
exports.turnOnDeskLampIfNeeded = async function() {
  const { autoTurnOnDeskLamp } = await db.getHeaterConfig();
  const motionSensorState = await getMotionSensorState();

  logger.debug(`turnOnDeskLampIfNeeded(): %j`, { autoTurnOnDeskLamp, motionSensorState, isNightTime: isNightTime() });

  if (autoTurnOnDeskLamp && isNightTime() && motionSensorState && motionSensorState.on === true) {
    logger.info('switching on device: deskLamp');
    mqttClient.publish(topics.deskLamp.cmnd(), '1');
  }
};

// turn on bathroom heater automatically
exports.toggleBathroomHeaterIfNeeded = async function() {
  const patioSensor = await db.getSensorData('nodemcu1');
  const setPoint = await getRoomSetPoint();
  const outsideSensorAvailable = patioSensor && patioSensor.AM2301;
  const currentHour = new Date().getHours();

  const shouldTurnOn =
    outsideSensorAvailable &&
    (patioSensor.AM2301.humidity >= 75 || patioSensor.AM2301.temperature < setPoint - 2) &&
    (currentHour >= 18 || currentHour < 8);

  logger.debug(`toggleBathroomHeaterIfNeeded(): %j`, { outsideSensorAvailable, setPoint, currentHour, shouldTurnOn });

  mqttClient.publish(topics.bathroom.cmnd(), shouldTurnOn ? '1' : '0');
};
