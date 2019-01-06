const db = require('./db');
const logger = require('./logger');
const mqttClient = require('./mqtt/client');
const topics = require('./mqtt/topics');
const { isDayTime, isNightTime, isBedTime, getMotionSensorState } = require('./utils');

// turn on/off desk lamp after 10 min of inactivity
exports.toggleDeskLamp = async function() {
  const { autoTurnOffDeskLamp } = await db.getHeaterConfig();
  const motionSensorState = await getMotionSensorState();

  logger.debug(`toggleDeskLamp(): %j`, { autoTurnOffDeskLamp, motionSensorState, isBedTime: isBedTime() });

  if (autoTurnOffDeskLamp && motionSensorState) {
    const motionSensorLastStateChangeDiff = Date.now() - motionSensorState.lastChange;
    if (isBedTime() && motionSensorState.on === false && motionSensorLastStateChangeDiff > 1000 * 60 * 10) {
      logger.info('switching off device: deskLamp');
      mqttClient.publish(topics.deskLamp.cmnd(), '0');
    }
  }
};

exports.turnOnDeskLampIfNeeded = async function() {
  const { autoTurnOnDeskLamp } = await db.getHeaterConfig();
  const motionSensorState = await getMotionSensorState();

  logger.debug(`turnOnDeskLampIfNeeded(): %j`, { autoTurnOnDeskLamp, motionSensorState, isNightTime: isNightTime() });

  if (autoTurnOnDeskLamp && isNightTime() && motionSensorState && motionSensorState.on === true) {
    logger.info('switching on device: deskLamp');
    mqttClient.publish(topics.deskLamp.cmnd(), '1');
  }
};

// turn on/off led power for specific devices
exports.toggleLedPower = async function() {
  const { autoLedPower } = await db.getHeaterConfig();

  logger.debug(`toggleLedPower(): %j`, { autoLedPower, isDayMode: isDayTime(), isNightMode: isNightTime() });

  Object.keys(autoLedPower).forEach(async (deviceName) => {
    const shouldTurnOn = !!autoLedPower[deviceName];
    const ledPower = (await db.get(`${deviceName}.ledPower`)) || null;

    if (!shouldTurnOn && (!ledPower || ledPower === 'on')) {
      // set led off by default
      turnOnDeviceLed(deviceName, false);
    } else if (shouldTurnOn) {
      if (isNightTime() && (!ledPower || ledPower === 'off')) {
        turnOnDeviceLed(deviceName, true);
      } else if (isDayTime() && (!ledPower || ledPower === 'on')) {
        turnOnDeviceLed(deviceName, false);
      }
    }
  });
};

function turnOnDeviceLed(deviceName, on) {
  logger.debug(`turnOnDeviceLed(): %j`, { deviceName, on });

  if (on) {
    logger.info(`switching led on for device: ${deviceName}`);
    mqttClient.publish(topics[deviceName].cmnd('LedPower'), '1');
  } else {
    logger.info(`switching led off for device: ${deviceName}`);
    mqttClient.publish(topics[deviceName].cmnd('LedPower'), '0');
    mqttClient.publish(topics[deviceName].cmnd('LedState'), '1');
  }
}
