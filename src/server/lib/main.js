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
    mqttClient.publish(topics[deviceName].cmnd, on ? '1' : '0');
  }
}

async function getRoomTriggerTemp() {
  const heaterConfig = await db.getHeaterConfig();
  const { defaultTriggerTemp, tempGroups } = heaterConfig;
  const currentHour = new Date().getHours();
  const currentTempGroup = tempGroups.find(entry => currentHour >= entry.start && currentHour < entry.end);
  const triggerTemp = currentTempGroup ? currentTempGroup.temp : defaultTriggerTemp;

  return triggerTemp;
}

async function updateHeaterState() {
  logger.debug(`updateHeaterState()`);

  const sensor = await db.getSensorData('heater1');

  if (!sensor) {
    logger.error(`not enough data! skipping...`);
    return;
  }

  const realFeel = sensor.realFeel;
  const triggerTemp = await getRoomTriggerTemp();

  logger.info('trigger temp: %d', triggerTemp);

  if (realFeel < triggerTemp) {
    turnOnDevice('heater1', true);
    turnOnDevice('heater2', true);
  }

  if (realFeel >= (triggerTemp + 0.1)) {
    // turn off heater2 when realFeel exceeds .1 threshold
    turnOnDevice('heater2', false);

    // turn off heater1 when realFeel exceeds .5 threshold
    if (realFeel >= (triggerTemp + 0.5)) {
      turnOnDevice('heater1', false);
    }
  }
}

async function updateReport() {
  logger.debug(`updateReport()`);

  const triggerTemp = await getRoomTriggerTemp();
  const heaterSensor = await db.getSensorData('heater1');
  const loungeSensor = await db.getSensorData('wemos1');

  let report = {
    config: { triggerTemp },
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

exports.updateHeaterState = updateHeaterState;
exports.updateReport = updateReport;
exports.getRealFeel = getRealFeel;
exports.getSensorReadings = getSensorReadings;
