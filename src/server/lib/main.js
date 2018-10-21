const Feels = require('feels');
const logger = require('./logger');
const { getWeather } = require('./weather');
const db = require('./db');
const topics = require('./mqtt/topics');
const mqttClient = require('./mqtt/client');

function getRealFeel(temperature, humidity, speed = 0) {
  const feelsLike = new Feels({
    temp: temperature,
    humidity,
    speed
  }).like();

  // Round to one decimal
  return Math.round(feelsLike * 10) / 10;
}

function getSensorReadings(data, sensorName) {
  const sensor = data && data[sensorName];

  if (!sensor) return null;

  const temperature = parseFloat(sensor.Temperature) || null; // can't be 0, sorry!
  const humidity = parseFloat(sensor.Humidity) || null; // 0% humidity would be nice!
  const realFeel = getRealFeel(temperature, humidity);

  return { temperature, humidity, realFeel };
}

async function updateDeviceState(deviceName, payload) {
  const on = String(payload).toLowerCase() === 'on';
  const lastChange = Date.now();
  logger.debug(`Saving ${deviceName} state data: %j`, { on, lastChange });
  await db.set(`${deviceName}.state`, JSON.stringify({ on, lastChange }));
}

async function updateDeviceLedPower(deviceName, payload) {
  const data = JSON.parse(payload);
  if (data.LedPower) {
    const ledPower = String(data.LedPower).toLowerCase();
    logger.debug(`Saving ${deviceName} led power state: %s`, ledPower);
    await db.set(`${deviceName}.ledPower`, ledPower);
  }
}

async function turnOnDevice(deviceName, on) {
  logger.debug(`turnOnDevice(): %j`, { on });

  const state = await db.getDeviceState(deviceName);
  const stateStr = on ? 'on' : 'off';

  if (!state) {
    logger.error(`${deviceName}: not enough data! skipping...`);
    return;
  }

  if (state.on === on) {
    logger.info(`${deviceName}: already ${stateStr}! skipping...`);
    return;
  }

  const heaterConfig = await db.getHeaterConfig();

  // calculate how long the device has been in this state
  const stateDuration = Math.round((Date.now() - state.lastChange) / 1000);

  logger.info(`${deviceName}: last state change was ${stateDuration} seconds ago`);

  // keep the same state for at least X minutes
  if (stateDuration < heaterConfig.minStateDurationSecs) {
    logger.info(`skipping...`);
    return;
  }

  logger.info(`${deviceName}: turning ${stateStr}...`);

  if (process.env.NODE_ENV !== 'development') {
    mqttClient.publish(topics[deviceName].cmnd('power'), on ? '1' : '0');
  }
}

async function getRoomSetPoint() {
  const heaterConfig = await db.getHeaterConfig();
  const { defaultSetPoint, tempGroups } = heaterConfig;
  const currentHour = new Date().getHours();
  const currentTempGroup = tempGroups.find(entry => currentHour >= entry.start && currentHour < entry.end);
  const setPoint = currentTempGroup ? currentTempGroup.temp : defaultSetPoint;
  return setPoint;
}

async function updateHeaterState() {
  logger.debug(`updateHeaterState()`);

  const sensor = await db.getSensorData('heater1');

  if (!sensor) {
    logger.error(`not enough data! skipping...`);
    return;
  }

  const { trigger } = await db.getHeaterConfig();
  const triggerTemp = trigger === 'temp' ? sensor.temperature : sensor.realFeel;
  const setPoint = await getRoomSetPoint();

  logger.info('set point: %d', setPoint);
  logger.info('trigger temp: %d', triggerTemp);

  if (triggerTemp < setPoint) {
    turnOnDevice('heater1', true);
    turnOnDevice('heater2', true);
  }

  if (triggerTemp >= (setPoint + 0.1)) {
    // turn off heater2 when setPoint exceeds .1 threshold
    turnOnDevice('heater2', false);

    // turn off heater1 when setPoint exceeds .5 threshold
    if (triggerTemp >= (setPoint + 0.5)) {
      turnOnDevice('heater1', false);
    }
  }
}

async function updateReport() {
  logger.debug(`updateReport()`);

  const setPoint = await getRoomSetPoint();
  const heaterSensor = await db.getSensorData('heater1');
  const loungeSensor = await db.getSensorData('wemos1');

  let report = {
    config: { setPoint },
    room: heaterSensor,
    lounge: loungeSensor
  };

  try {
    const weather = await getWeather();

    Object.assign(report, {
      weather: {
        temperature: Math.round(weather.main.temp * 10) / 10,
        humidity: weather.main.humidity,
        realFeel: getRealFeel(weather.main.temp, weather.main.humidity, weather.wind.speed),
        windSpeedKmh: Math.round(weather.wind.speed / 1000 * 3600)
      }
    });
  } catch (err) {
    logger.error('error parsing weather report');
  }

  logger.info('custom report: %j', report);

  mqttClient.publish(topics.report, JSON.stringify(report), { retain: true });
}

async function runScheduledActions() {
  const currentHour = new Date().getHours();
  const isNightMode = currentHour >= 19 || currentHour < 7;
  const isBedTime = currentHour >= 23 || currentHour < 7;
  const isDayMode = currentHour >= 7 && currentHour < 19;
  const { autoLedPower } = await db.getHeaterConfig();

  logger.debug(`runScheduledActions(): %j`, { autoLedPower, currentHour, isNightMode, isDayMode, isBedTime });

  Object.keys(autoLedPower).forEach(async (deviceName) => {
    if (autoLedPower[deviceName]) {
      const ledPower = await db.get(`${deviceName}.ledPower`) || null;
      if (isNightMode && (!ledPower || ledPower === 'off')) {
        // night mode
        logger.info(`switching led on for device ${deviceName}`);
        mqttClient.publish(topics[deviceName].cmnd('LedPower'), '1');
      } else if (isDayMode && (!ledPower || ledPower === 'on')) {
        // day mode
        logger.info(`switching led off for device ${deviceName}`);
        mqttClient.publish(topics[deviceName].cmnd('LedPower'), '0');
        mqttClient.publish(topics[deviceName].cmnd('LedState'), '1');
      }
    }
  });

  // turn on/off desk lamp after 15 min of inactivity
  const motionSensorState = await db.getDeviceState('wemos1');
  if (motionSensorState) {
    const motionSensorLastStateChangeDiff = Date.now() - motionSensorState.lastChange;
    if (isBedTime && motionSensorState.on === false && motionSensorLastStateChangeDiff > (1000 * 60 * 15)) {
      logger.info('switching off device: deskLamp');
      mqttClient.publish(topics.deskLamp.cmnd(), '0');
    }
  }
}

exports.updateDeviceState = updateDeviceState;
exports.updateHeaterState = updateHeaterState;
exports.updateReport = updateReport;
exports.getRealFeel = getRealFeel;
exports.getSensorReadings = getSensorReadings;
exports.runScheduledActions = runScheduledActions;
exports.updateDeviceLedPower = updateDeviceLedPower;
