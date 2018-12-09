const Feels = require('feels');
const { DateTime } = require('luxon');
const SolarCalc = require('solar-calc');

const LATITUDE = Number(process.env.LATITUDE);
const LONGITUDE = Number(process.env.LONGITUDE);

function getRealFeel(temperature, humidity, speed = 0) {
  const feelsLike = new Feels({
    temp: temperature,
    humidity,
    speed
  }).like();

  // Round to one decimal
  return Math.round(feelsLike * 10) / 10;
}

function getSolarCalc() {
  const calc = new SolarCalc(new Date(), LATITUDE, LONGITUDE);
  return {
    sunrise: calc.sunrise,
    sunset: calc.sunset,
  }
}

function isDayTime() {
  const calc = new SolarCalc(new Date(), LATITUDE, LONGITUDE);
  const sunrise = DateTime.fromJSDate(calc.sunrise);
  return sunrise.diffNow().as('minutes') < 0;
}

function isNightTime() {
  const calc = new SolarCalc(new Date(), LATITUDE, LONGITUDE);
  const sunset = DateTime.fromJSDate(calc.sunset);
  return sunset.diffNow().as('minutes') < 0;
}

function isBedTime() {
  const calc = new SolarCalc(new Date(), LATITUDE, LONGITUDE);
  const bedTime = DateTime.fromJSDate(calc.sunset).plus({ minutes: 150 }); // 2:30h after sunset
  return bedTime.diffNow().as('minutes') < 0;
}

exports.getRealFeel = getRealFeel;
exports.isDayTime = isDayTime;
exports.isNightTime = isNightTime;
exports.isBedTime = isBedTime;
exports.getSolarCalc = getSolarCalc;
