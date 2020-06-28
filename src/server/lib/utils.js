const Feels = require('feels');
const { DateTime } = require('luxon');
const SolarCalc = require('solar-calc');
const { getWeather } = require('./weather');
const logger = require('./logger');

const db = require('./db');
const { get } = require('lodash');

const LATITUDE = Number(process.env.LATITUDE);
const LONGITUDE = Number(process.env.LONGITUDE);

exports.getRealFeel = function getRealFeel(temperature, humidity, speed = 0) {
  const feelsLike = new Feels({
    temp: temperature,
    humidity,
    speed,
  }).like();

  // Round to one decimal
  return Math.round(feelsLike * 10) / 10;
};

exports.getSolarCalc = function getSolarCalc() {
  const calc = new SolarCalc(new Date(), LATITUDE, LONGITUDE);
  return {
    sunrise: calc.sunrise,
    sunset: calc.sunset,
  };
};

exports.isNightTime = function isNightTime() {
  const calc = new SolarCalc(new Date(), LATITUDE, LONGITUDE);
  const sunset = DateTime.fromJSDate(calc.sunset);
  const sunrise = DateTime.fromJSDate(calc.sunrise);
  return (
    sunset.diffNow().as('minutes') < 0 || sunrise.diffNow().as('minutes') > 0
  );
};

exports.isBedTime = async function isBedTime() {
  const { bedTime } = await db.getConfig();
  const calc = new SolarCalc(new Date(), LATITUDE, LONGITUDE);
  const sunrise = DateTime.fromJSDate(calc.sunrise);
  const bedTimeDate =
    bedTime === null
      ? DateTime.fromJSDate(calc.sunset)
      : DateTime.fromFormat(bedTime, 'HH:mm');
  return (
    bedTimeDate.diffNow().as('minutes') < 0 ||
    sunrise.diffNow().as('minutes') > 0
  );
};

exports.getMotionSensorState = async function getMotionSensorState() {
  const values = await Promise.all([
    db.getDeviceState('wemos1.switch1'),
    db.getDeviceState('wemos1.switch2'),
  ]);
  const sensors = values.filter((v) => !!v);

  if (sensors.length === 0) {
    return null;
  }

  const isOff = sensors.every((v) => !v.on);

  if (isOff) {
    const lastChange = Math.max(...sensors.map((v) => v.lastChange));
    return { on: false, lastChange, sensors };
  }

  const onSensors = sensors.filter((v) => v.on);
  const lastChange = Math.min(...onSensors.map((v) => v.lastChange));

  return {
    on: true,
    lastChange,
    sensors,
  };
};

exports.getDevicePowerStateFromPayload = (payload) => {
  const stateValue = String(payload).toLowerCase();
  return stateValue === 'on' || stateValue === '1';
};

exports.getRoomSetPoints = async () => {
  const config = await db.getConfig();
  const rooms = Object.keys(config.rooms);
  const setPoints = {};
  for (const name of rooms) {
    setPoints[name] = await getRoomSetPoint(name);
  }
  return setPoints;
};

/**
 * @returns {Promise<number|null>}
 */
exports.getOutsideTemperature = async () => {
  const data = await db.getSensorData('garden');

  if (data && data.DS18B20) {
    return data.DS18B20.temperature;
  }

  const weather = await getWeatherReadings();

  if (weather !== null) {
    return weather.temperature;
  }

  return null;
};

async function getWeatherReadings() {
  try {
    const weather = await getWeather();

    return {
      temperature: Math.round(weather.main.temp * 10) / 10,
      humidity: weather.main.humidity,
      realFeel: exports.getRealFeel(
        weather.main.temp,
        weather.main.humidity,
        weather.wind.speed
      ),
      windSpeedKmh: Math.round((weather.wind.speed / 1000) * 3600),
      lastUpdate: weather.dt ? weather.dt * 1000 : null,
    };
  } catch (err) {
    return null;
  }
}

async function getRoomSetPoint(room) {
  const config = await db.getConfig();
  const roomConfig = config.rooms[room];

  if (!roomConfig) {
    throw new Error(`Config not found for room: ${room}`);
  }

  const { defaultSetPoint, tempGroups } = config.rooms[room];
  const currentHour = new Date().getHours();
  const currentTempGroup = tempGroups.find(
    (entry) => currentHour >= entry.start && currentHour < entry.end
  );
  const setPoint = currentTempGroup ? currentTempGroup.temp : defaultSetPoint;
  return setPoint;
}

/**
 *
 * @param {object|string} heatingDeviceValue
 * @returns {Promise<string|null>}
 */
async function getHeatingDeviceForRoom(heatingDeviceValue) {
  if (heatingDeviceValue === null) {
    return null;
  }

  if (typeof heatingDeviceValue === 'string') {
    return heatingDeviceValue;
  }

  const telemetryData = await db.getDeviceTelemetryData(
    heatingDeviceValue.name
  );

  if (!telemetryData) {
    logger.warn(`No telemetry data found for device 'mobileHeater`);
    return null;
  }

  const conditions = heatingDeviceValue.conditions;
  const conditionsApply = Object.keys(conditions).every((conditionId) => {
    const conditionIdValue = get(telemetryData, conditionId);
    const conditionOperators = Object.keys(conditions[conditionId]);
    return conditionOperators.every((op) => {
      const opValue = conditions[conditionId][op];
      switch (op) {
        case '$eq':
          return conditionIdValue === opValue;
        case '$lt':
          return conditionIdValue < opValue;
        case '$lte':
          return conditionIdValue <= opValue;
        case '$gt':
          return conditionIdValue > opValue;
        case '$gte':
          return conditionIdValue >= opValue;
      }
    });
  });

  return conditionsApply ? heatingDeviceValue.name : null;
}

exports.getRoomSetPoint = getRoomSetPoint;
exports.getHeatingDeviceForRoom = getHeatingDeviceForRoom;
exports.getWeatherReadings = getWeatherReadings;
