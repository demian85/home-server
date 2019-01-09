const Feels = require('feels');
const { DateTime } = require('luxon');
const SolarCalc = require('solar-calc');

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

exports.isDayTime = function isDayTime() {
  const calc = new SolarCalc(new Date(), LATITUDE, LONGITUDE);
  const sunrise = DateTime.fromJSDate(calc.sunrise);
  return sunrise.diffNow().as('minutes') < 0;
};

exports.isNightTime = function isNightTime() {
  const calc = new SolarCalc(new Date(), LATITUDE, LONGITUDE);
  const sunset = DateTime.fromJSDate(calc.sunset);
  return sunset.diffNow().as('minutes') < 0;
};

exports.isBedTime = function isBedTime() {
  const calc = new SolarCalc(new Date(), LATITUDE, LONGITUDE);
  const bedTime = DateTime.fromJSDate(calc.sunset).plus({ minutes: 150 }); // 2:30h after sunset
  return bedTime.diffNow().as('minutes') < 0;
};

exports.getMotionSensorState = async function getMotionSensorState() {
  const values = await Promise.all([db.getDeviceState('wemos1.switch1'), db.getDeviceState('wemos1.switch2')]);
  const sensors = values.filter((v) => !!v);

  if (sensors.length === 0) {
    return null;
  }

  const isOff = sensors.every((v) => !v.on);

  if (isOff) {
    const lastChange = Math.max(...sensors.map((v) => v.lastChange));
    return { on: false, lastChange };
  }

  const onSensors = sensors.filter((v) => v.on);
  const lastChange = Math.min(...onSensors.map((v) => v.lastChange));
  return { on: true, lastChange };
};
