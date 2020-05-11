const Feels = require('feels');
const { DateTime } = require('luxon');
const SolarCalc = require('solar-calc');
const { getWeather } = require('./weather');

const db = require('./db');

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

exports.getRoomSetPoint = async function getRoomSetPoint(room) {
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
};

exports.getOutsideTemperature = async () => {
  const data = await db.getSensorData('laundry');

  return data && data.DS18B20 ? data.DS18B20.temperature : null;
};

exports.getWeatherReadings = async () => {
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
};
