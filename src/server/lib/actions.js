const db = require('./db');
const logger = require('./logger');
const mqttClient = require('./mqtt/client');
const topics = require('./mqtt/topics');
const { isDayTime, isNightTime, isBedTime, getMotionSensorState } = require('./utils');
const { getWeather } = require('./weather');

// turn on/off desk lamp after 10 min of inactivity
exports.toggleDeskLamp = async function() {
  const { autoTurnOffDeskLamp } = await db.getHeaterConfig();
  const motionSensorState = await getMotionSensorState();

  logger.debug(`toggleDeskLamp(): %j`, { autoTurnOffDeskLamp, motionSensorState, isBedTime: isBedTime() });

  if (autoTurnOffDeskLamp && motionSensorState) {
    const motionSensorLastStateChangeDiff = Date.now() - motionSensorState.lastChange;
    if (isBedTime() && motionSensorState.on === false && motionSensorLastStateChangeDiff > 1000 * 60 * 5) {
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

exports.updateOLEDDisplay = async function() {
  const { enableOledDisplay } = await db.getHeaterConfig();

  logger.debug(`updateOLEDDisplay(): %j`, { enableOledDisplay });

  if (!enableOledDisplay) {
    return;
  }

  const heaterSensor = await db.getSensorData('heater1');
  const loungeSensor = await db.getSensorData('wemos1');
  const commands = [`DisplayText [z]`];
  let displayCommand = `DisplayText [f1l1c1]Room temp: ${heaterSensor.temperature} C [f1l3c1]Living temp: ${
    loungeSensor.AM2301.temperature
  } C`;

  try {
    const weather = await getWeather();
    const outsideTemp = Math.round(weather.main.temp * 10) / 10;
    displayCommand += ` [f1l5c1]Outside: ${outsideTemp} C`;
  } catch (err) {
    logger.error('error parsing weather report: %o', err);
  }

  commands.push(displayCommand);

  mqttClient.publish(topics.wemos1.cmnd('Backlog'), commands.join(';'));
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
