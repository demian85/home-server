const db = require('./db');
const logger = require('./logger');
const mqttClient = require('./mqtt/client');
const topics = require('./mqtt/topics');
const { isNightTime, isBedTime, getMotionSensorState } = require('./utils');

// turn off desk lamp N minutes after motion sensor goes off
exports.turnOffDeskLampIfNeeded = async function() {
  const { autoTurnOffDeskLamp, autoTurnOffDeskLampDelay } = await db.getHeaterConfig();
  const motionSensorState = await getMotionSensorState();

  logger.debug(`turnOffDeskLampIfNeeded(): %j`, { autoTurnOffDeskLamp, motionSensorState, isBedTime: isBedTime() });

  if (autoTurnOffDeskLamp && motionSensorState) {
    const motionSensorLastStateChangeDiff = Date.now() - motionSensorState.lastChange;
    if (
      isBedTime() &&
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
