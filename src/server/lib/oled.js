const db = require('./db');
const logger = require('./logger');
const mqttClient = require('./mqtt/client');
const topics = require('./mqtt/topics');
const { getWeather } = require('./weather');
const { DateTime } = require('luxon');

let currentStateIndex = -1;

const displayStates = [getTemperatureInfo, getHumidityInfo, getSensorInfo, getTimeInfo];

async function displayNextState() {
  currentStateIndex = currentStateIndex === displayStates.length - 1 ? 0 : currentStateIndex + 1;
  const textLines = await displayStates[currentStateIndex]();
  displayText(textLines, 2);
}

function clearDisplay() {
  logger.debug(`clearDisplay()`);

  mqttClient.publish(topics.wemos1.cmnd('DisplayText'), '[z]');
  currentStateIndex = -1;
}

function displayText(textLines = [], size = 1) {
  logger.debug(`displayText()`);

  const cmnd = textLines
    .map((text, index) => {
      const line = index + 1;
      return `[s${size}l${line}c1]${text}`;
    })
    .join(' ');

  mqttClient.publish(topics.wemos1.cmnd('DisplayText'), cmnd);
}

async function getTemperatureInfo() {
  const heaterSensor = await db.getSensorData('heater1');
  const loungeSensor = await db.getSensorData('wemos1');
  const cmnd = [];

  if (heaterSensor) {
    cmnd.push(`R: ${heaterSensor.temperature} C`);
  }

  if (loungeSensor && loungeSensor.AM2301) {
    cmnd.push(`L: ${loungeSensor.AM2301.temperature} C`);
  }

  try {
    const weather = await getWeather();
    const outsideTemp = Math.round(weather.main.temp * 10) / 10;
    cmnd.push(`P: ${outsideTemp} C`);
  } catch (err) {
    logger.error('error parsing weather report: %o', err);
  }

  return cmnd;
}

async function getHumidityInfo() {
  const heaterSensor = await db.getSensorData('heater1');
  const loungeSensor = await db.getSensorData('wemos1');
  const cmnd = [];

  if (heaterSensor) {
    cmnd.push(`R: ${heaterSensor.humidity} %`);
  }

  if (loungeSensor && loungeSensor.AM2301) {
    cmnd.push(`L: ${loungeSensor.AM2301.humidity} %`);
  }

  try {
    const weather = await getWeather();
    cmnd.push(`P: ${weather.main.humidity} %`);
  } catch (err) {
    logger.error('error parsing weather report: %o', err);
  }

  return cmnd;
}

async function getSensorInfo() {
  const loungeSensor = await db.getSensorData('wemos1');
  let cmnd = [];

  if (loungeSensor && loungeSensor.MQ135) {
    cmnd.push(`Air Q: ${loungeSensor.MQ135.airQuality}%`);
  }

  if (loungeSensor && loungeSensor.BMP280) {
    cmnd.push(`${loungeSensor.BMP280.pressure}hPa`);
  }

  if (loungeSensor && loungeSensor.BH1750) {
    cmnd.push(`${loungeSensor.BH1750.illuminance}lx`);
  }

  return cmnd;
}

async function getTimeInfo() {
  const date = DateTime.local();
  const dateString = date.toFormat('d/L/y');
  const timeString = date.toFormat('HH:mm');
  return [dateString, timeString];
}

exports.clearDisplay = clearDisplay;
exports.displayText = displayText;
exports.displayNextState = displayNextState;
