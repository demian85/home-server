const db = require('../db');
const logger = require('../logger');
const mqttClient = require('../mqtt/client');
const topics = require('../mqtt/topics');
const {
  isNightTime,
  isBedTime,
  getMotionSensorState,
  getRoomSetPoint,
  getOutsideTemperature,
} = require('../utils');
const { turnOnDevice } = require('../main');

const actions = [
  turnOnDeskLampIfNeeded,
  turnOffDeskLampIfNeeded,
  // toggleBathroomHeaterIfNeeded,
];

exports.runScheduledActions = function runScheduledActions() {
  logger.debug(`runScheduledActions()`);

  for (const action of actions) {
    action();
  }

  setTimeout(runScheduledActions, 60000);
};

// turn off desk lamp N minutes after motion sensor goes off
async function turnOffDeskLampIfNeeded() {
  const {
    autoTurnOffDeskLamp,
    autoTurnOffDeskLampDelay,
  } = await db.getConfig();
  const motionSensorState = await getMotionSensorState();
  const bedTime = await isBedTime();

  logger.debug(`turnOffDeskLampIfNeeded()`, {
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
  const { autoTurnOnDeskLamp } = await db.getConfig();
  const motionSensorState = await getMotionSensorState();

  logger.debug(`turnOnDeskLampIfNeeded()`, {
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

// turn on/off bathroom heater rail automatically
async function toggleBathroomHeaterIfNeeded() {
  const outsideTemperature = await getOutsideTemperature();
  const humidity = await db.getSensorData('heaterPanel');
  const setPoint = await getRoomSetPoint('smallRoom');
  const currentHour = new Date().getHours();

  const shouldTurnOn =
    outsideTemperature &&
    (humidity >= 75 || outsideTemperature < setPoint - 2) &&
    (currentHour >= 18 || currentHour < 7);

  logger.debug(`toggleBathroomHeaterIfNeeded()`, {
    outsideTemperature,
    humidity,
    setPoint,
    currentHour,
    shouldTurnOn,
  });

  turnOnDevice('CHANGE ME', shouldTurnOn);
}
