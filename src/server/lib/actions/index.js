const db = require('../db');
const logger = require('../logger');
const mqttClient = require('../mqtt/client');
const topics = require('../mqtt/topics');
const {
  isNightTime,
  isBedTime,
  getMotionSensorState,
  getRoomSetPoint,
} = require('../utils');
const { turnOnDevice } = require('../main');

exports.runScheduledActions = function runScheduledActions() {
  logger.debug(`runScheduledActions()`);

  turnOnDeskLampIfNeeded();
  turnOffDeskLampIfNeeded();
  toggleBathroomHeaterIfNeeded();

  setTimeout(runScheduledActions, 60000);
};

// turn off desk lamp N minutes after motion sensor goes off
async function turnOffDeskLampIfNeeded() {
  const {
    autoTurnOffDeskLamp,
    autoTurnOffDeskLampDelay,
  } = await db.getHeaterConfig();
  const motionSensorState = await getMotionSensorState();
  const bedTime = await isBedTime();

  logger.debug(`turnOffDeskLampIfNeeded(): %j`, {
    autoTurnOffDeskLamp,
    motionSensorState,
    isBedTime: bedTime,
  });

  if (autoTurnOffDeskLamp && motionSensorState) {
    const motionSensorLastStateChangeDiff =
      Date.now() - motionSensorState.lastChange;
    if (
      bedTime &&
      motionSensorState.on === false &&
      motionSensorLastStateChangeDiff > 1000 * autoTurnOffDeskLampDelay
    ) {
      logger.info('switching off device: deskLamp');
      mqttClient.publish(topics.deskLamp.cmnd(), '0');
    }
  }
}

// turn on desk lamp during night time when motion sensor goes ON
async function turnOnDeskLampIfNeeded() {
  const { autoTurnOnDeskLamp } = await db.getHeaterConfig();
  const motionSensorState = await getMotionSensorState();

  logger.debug(`turnOnDeskLampIfNeeded(): %j`, {
    autoTurnOnDeskLamp,
    motionSensorState,
    isNightTime: isNightTime(),
  });

  if (
    autoTurnOnDeskLamp &&
    isNightTime() &&
    motionSensorState &&
    motionSensorState.on === true
  ) {
    logger.info('switching on device: deskLamp');
    mqttClient.publish(topics.deskLamp.cmnd(), '1');
  }
}

// turn on/off bathroom heater automatically
async function toggleBathroomHeaterIfNeeded() {
  const patioSensor = await db.getSensorData('laundry');
  const setPoint = await getRoomSetPoint();
  const outsideSensorAvailable = patioSensor && patioSensor.DS18B20;
  const currentHour = new Date().getHours();

  const shouldTurnOn =
    outsideSensorAvailable &&
    (patioSensor.DS18B20.humidity >= 75 ||
      patioSensor.DS18B20.temperature < setPoint - 2) &&
    (currentHour >= 18 || currentHour < 7);

  logger.debug(`toggleBathroomHeaterIfNeeded(): %j`, {
    outsideSensorAvailable,
    setPoint,
    currentHour,
    shouldTurnOn,
  });

  turnOnDevice('bathroom', shouldTurnOn);
}

exports.turnOffDeskLampIfNeeded = turnOffDeskLampIfNeeded;
exports.turnOnDeskLampIfNeeded = turnOnDeskLampIfNeeded;
exports.toggleBathroomHeaterIfNeeded = toggleBathroomHeaterIfNeeded;
