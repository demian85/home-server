const logger = require('./logger');
const db = require('./db');
const topics = require('./mqtt/topics');
const mqttClient = require('./mqtt/client');
const {
  getRealFeel,
  getSolarCalc,
  getMotionSensorState,
  getRoomSetPoint,
  getOutsideTemperature,
  getWeatherReadings,
  getRoomSetPoints,
} = require('./utils');

function getSensorReadings(data, sensorName) {
  const sensor = data && data[sensorName];

  if (!sensor) {
    return;
  }

  const temperature =
    sensor.Temperature !== undefined
      ? parseFloat(sensor.Temperature)
      : undefined;
  const humidity =
    sensor.Humidity !== undefined ? parseFloat(sensor.Humidity) : undefined;
  const pressure =
    sensor.Pressure !== undefined ? parseFloat(sensor.Pressure) : undefined;
  const illuminance =
    sensor.Illuminance !== undefined
      ? parseFloat(sensor.Illuminance)
      : undefined;
  const realFeel =
    temperature && humidity ? getRealFeel(temperature, humidity) : undefined;

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

  const config = await db.getConfig();

  // calculate how long the device has been in this state
  const stateDuration = Math.round((Date.now() - state.lastChange) / 1000);

  logger.info(
    `${deviceName}: last state change was ${stateDuration} seconds ago`
  );

  // keep the same state for at least X minutes
  if (stateDuration < config.minStateDurationSecs) {
    logger.info(`skipping...`);
    return;
  }

  logger.info(`${deviceName}: turning ${stateStr}...`);

  if (process.env.NODE_ENV !== 'development') {
    mqttClient.publish(topics[deviceName].cmnd('power'), on ? '1' : '0');
  }
}

async function updateRoomHeating(room) {
  logger.debug(`updateRoomHeating(%s), room`);

  const config = await db.getConfig();

  const roomConfig = config.rooms[room];

  if (!roomConfig) {
    logger.error(`Config not found for room ${room}, skipping...`);
    return;
  }

  if (!roomConfig.autoMode) {
    logger.debug(`Auto mode disabled for room ${room}, skipping...`);
    return;
  }

  const roomSensor = await db.getSensorData(roomConfig.source.device);

  if (!roomSensor) {
    logger.error(`Sensor data not found for room ${room}, skipping...`);
    return;
  }

  const temperatureSensor = roomSensor[roomConfig.source.sensor];

  if (!temperatureSensor) {
    logger.error(
      `Temperature data not available for sensor ${roomConfig.source.sensor}, skipping...`
    );
    return;
  }

  const setPoint = await getRoomSetPoint(room);
  const outsideTemperature = await getOutsideTemperature();
  const outsideTempAvailable = outsideTemperature !== null;
  const sensorValue = temperatureSensor.temperature;
  const tempDiff = outsideTempAvailable ? setPoint - outsideTemperature : 0;
  const isTooCold = outsideTempAvailable && tempDiff >= 4;

  logger.info('updating room heating: %j', {
    room,
    roomConfig,
    sensorValue,
    outsideTemperature,
    tempDiff,
    isTooCold,
  });

  if (sensorValue < setPoint) {
    turnOnDevice(roomConfig.heatingDevice, true);
  } else if (sensorValue >= setPoint + roomConfig.threshold) {
    const maxSensorValue = setPoint + roomConfig.threshold + 0.2;
    const shouldTurnPanelOff = !isTooCold || sensorValue >= maxSensorValue;
    turnOnDevice(roomConfig.heatingDevice, !shouldTurnPanelOff);
  }
}

async function updateReport() {
  logger.debug(`updateReport()`);

  const config = await db.getConfig();
  const lounge = await db.getSensorData('wemos1');
  const room = await db.getSensorData('nodemcu1');
  const smallRoom = await db.getSensorData('heaterPanel');
  const laundry = await db.getSensorData('laundry');
  const motionSensor = await getMotionSensorState();
  const { sunrise, sunset } = getSolarCalc();
  const weather = await getWeatherReadings();

  const setPoints = await getRoomSetPoints();

  let report = {
    config,
    heating: {
      setPoints,
    },
    room,
    smallRoom,
    lounge,
    laundry,
    motionSensor,
    weather,
    data: {
      sunrise: sunrise.toISOString(),
      sunset: sunset.toISOString(),
    },
  };

  logger.info('custom report: %j', report);

  mqttClient.publish(topics.report, JSON.stringify(report), { retain: true });
}

exports.updateDeviceState = updateDeviceState;
exports.updateDeviceOnlineStatus = updateDeviceOnlineStatus;
exports.updateRoomHeating = updateRoomHeating;
exports.updateReport = updateReport;
exports.getRealFeel = getRealFeel;
exports.getSensorReadings = getSensorReadings;
exports.turnOnDevice = turnOnDevice;
