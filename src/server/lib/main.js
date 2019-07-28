const logger = require('./logger');
const { getWeather } = require('./weather');
const db = require('./db');
const topics = require('./mqtt/topics');
const mqttClient = require('./mqtt/client');
const { getRealFeel, getSolarCalc, getMotionSensorState, getRoomSetPoint } = require('./utils');
const { turnOnDeskLampIfNeeded, turnOffDeskLampIfNeeded, toggleBathroomHeaterIfNeeded } = require('./actions');

function getSensorReadings(data, sensorName) {
  const sensor = data && data[sensorName];

  if (!sensor) {
    return;
  }

  const temperature = sensor.Temperature !== undefined ? parseFloat(sensor.Temperature) : undefined;
  const humidity = sensor.Humidity !== undefined ? parseFloat(sensor.Humidity) : undefined;
  const pressure = sensor.Pressure !== undefined ? parseFloat(sensor.Pressure) : undefined;
  const illuminance = sensor.Illuminance !== undefined ? parseFloat(sensor.Illuminance) : undefined;
  const realFeel = temperature && humidity ? getRealFeel(temperature, humidity) : undefined;

  return {
    temperature,
    humidity,
    pressure,
    illuminance,
    realFeel,
    lastUpdate: Date.now(),
  };
}

async function updateDeviceState(deviceName, payload) {
  const stateValue = String(payload).toLowerCase();
  const on = stateValue === 'on' || stateValue === '1';
  const lastChange = Date.now();

  logger.debug(`Saving ${deviceName} state data: %j`, { on, lastChange });

  await db.set(`${deviceName}.state`, JSON.stringify({ on, lastChange }));
}

async function updateDeviceOnlineStatus(deviceName, payload) {
  const isOnline = String(payload).toLowerCase() === 'online';

  logger.debug(`Saving ${deviceName} online status: %j`, { isOnline });

  await db.set(`${deviceName}.online`, JSON.stringify(isOnline));
}

async function turnOnDevice(deviceName, on) {
  logger.debug(`turnOnDevice(): %j`, { deviceName, on });

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

async function updateHeaterState() {
  logger.debug(`updateHeaterState()`);

  const sensor = await db.getSensorData('heater1');

  if (!sensor) {
    logger.error(`not enough data! skipping...`);
    return;
  }

  const { trigger, threshold } = await db.getHeaterConfig();
  const patioSensor = await db.getSensorData('nodemcu1');
  const triggerTemp = trigger === 'temp' ? sensor.temperature : sensor.realFeel;
  const setPoint = await getRoomSetPoint();

  logger.info('set point: %d', setPoint);
  logger.info('trigger temp: %d', triggerTemp);
  logger.info('threshold: %d', threshold);

  if (triggerTemp < setPoint) {
    turnOnDevice('heater1', true);
    turnOnDevice('heater2', true);
  }

  // turn off heating when setPoint exceeds threshold
  if (triggerTemp >= setPoint + threshold) {
    turnOnDevice('heater2', false);

    const outsideTempAvailable = patioSensor && patioSensor.AM2301 && patioSensor.AM2301.temperature !== null;

    if (outsideTempAvailable) {
      const tempDiff = setPoint - patioSensor.AM2301.temperature;
      logger.info('tempDiff: %d', tempDiff);
      const shouldTurnPanelOff = tempDiff < 5 || triggerTemp > setPoint + 0.5;
      turnOnDevice('heater1', !shouldTurnPanelOff);
    } else {
      turnOnDevice('heater1', false);
    }
  }
}

async function updateReport() {
  logger.debug(`updateReport()`);

  const setPoint = await getRoomSetPoint();
  const heaterSensor = await db.getSensorData('heater1');
  const loungeSensor = await db.getSensorData('wemos1');
  const patioSensor = await db.getSensorData('nodemcu1');
  const motionSensor = await getMotionSensorState();
  const { sunrise, sunset } = getSolarCalc();

  let report = {
    config: { setPoint },
    room: heaterSensor,
    lounge: loungeSensor,
    patio: patioSensor,
    motionSensor,
    data: {
      sunrise: sunrise.toISOString(),
      sunset: sunset.toISOString(),
    },
  };

  try {
    const weather = await getWeather();

    Object.assign(report, {
      weather: {
        temperature: Math.round(weather.main.temp * 10) / 10,
        humidity: weather.main.humidity,
        realFeel: getRealFeel(weather.main.temp, weather.main.humidity, weather.wind.speed),
        windSpeedKmh: Math.round((weather.wind.speed / 1000) * 3600),
        lastUpdate: weather.dt ? weather.dt * 1000 : null,
      },
    });
  } catch (err) {
    logger.error('error parsing weather report: %o', err);
  }

  logger.info('custom report: %j', report);

  mqttClient.publish(topics.report, JSON.stringify(report), { retain: true });
}

function runScheduledActions() {
  logger.debug(`runScheduledActions()`);

  turnOnDeskLampIfNeeded();
  turnOffDeskLampIfNeeded();
  toggleBathroomHeaterIfNeeded();

  setTimeout(runScheduledActions, 60000);
}

exports.updateDeviceState = updateDeviceState;
exports.updateDeviceOnlineStatus = updateDeviceOnlineStatus;
exports.updateHeaterState = updateHeaterState;
exports.updateReport = updateReport;
exports.getRealFeel = getRealFeel;
exports.getSensorReadings = getSensorReadings;
exports.runScheduledActions = runScheduledActions;
