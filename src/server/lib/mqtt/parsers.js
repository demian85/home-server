const { debounce } = require('lodash');

const client = require('./client');
const logger = require('../logger');
const topics = require('./topics');
const db = require('../db');
const { updateDeviceState, updateHeaterState, updateReport, getSensorReadings } = require('../main');
const { turnOnDeskLampIfNeeded } = require('../actions');
const ir = require('../ir');
const { clearDisplay, displayNextState } = require('../oled');
const ifttt = require('../ifttt');
const { getDevicePowerStateFromPayload } = require('../utils');

const resetIn10Secs = debounce(() => {
  clearDisplay(true);
}, 10000);

const smartBulbCmndParser = (deviceName) => {
  return async (payload) => {
    const power = payload.toString().toLowerCase();
    const isOn = getDevicePowerStateFromPayload(power);
    const strState = isOn ? 'on' : 'off';
    const intState = isOn ? '1' : '0';

    await ifttt.sendEvent(`${deviceName}:power:${strState}`);
    client.publish(`stat/${deviceName}/POWER`, intState);
  };
};

const parsers = {
  [topics.heater1.stat]: async (payload) => {
    await updateDeviceState('heater1', payload);
  },

  [topics.heater2.stat]: async (payload) => {
    await updateDeviceState('heater2', payload);
  },

  [topics.deskLamp.stat]: async (payload) => {
    await updateDeviceState('deskLamp', payload);
  },

  [topics.bulb1.stat]: async (payload) => {
    await updateDeviceState('bulb1', payload);
  },

  [topics.heater1.sensor]: async (payload) => {
    const data = JSON.parse(payload.toString());
    const readings = getSensorReadings(data, 'SI7021');

    if (!readings) {
      return logger.error('Sensor SI7021 not found!');
    }

    logger.debug('Saving heater sensor readings: %j', readings);

    await db.set('heater1.sensor', JSON.stringify(readings));
    const { autoMode } = await db.getHeaterConfig();
    if (autoMode) {
      await updateHeaterState();
    }
    await updateReport();
  },

  [topics.wemos1.sensor]: async (payload) => {
    const data = JSON.parse(payload.toString());
    const AM2301 = getSensorReadings(data, 'AM2301');
    const BMP280 = getSensorReadings(data, 'BMP280');
    const BH1750 = getSensorReadings(data, 'BH1750');

    if (!AM2301) {
      logger.error('Sensor AM2301 not found!');
    }
    if (!BMP280) {
      logger.error('Sensor BMP280 not found!');
    }
    if (!BH1750) {
      logger.error('Sensor BH1750 not found!');
    }

    const readings = { AM2301, BMP280, BH1750 };

    logger.debug('Saving wemos1 sensor readings: %j', readings);

    await db.set('wemos1.sensor', JSON.stringify(readings));
    await updateReport();
  },

  [topics.nodemcu1.sensor]: async (payload) => {
    const data = JSON.parse(payload.toString());
    const AM2301 = getSensorReadings(data, 'AM2301');
    const analogReadings = data.ADS1115;

    if (!AM2301) {
      logger.error('Sensor AM2301 not found!');
    }
    if (!analogReadings) {
      logger.error('ADS1115 not found!');
    }

    const volts0 = (analogReadings.A0 * 0.1875) / 1000;
    const volts1 = (analogReadings.A1 * 0.1875) / 1000;
    const readings = {
      AM2301,
      MQ135: {
        volts: volts0,
        airQuality: 100 - Math.round((100 * volts0) / 5),
        lastUpdate: Date.now(),
      },
      SOIL: {
        volts: volts1,
        value: 100 - Math.round((100 * volts1) / 3.3), // resistive value
        lastUpdate: Date.now(),
      },
    };

    logger.debug('Saving nodemcu1 sensor readings: %j', { readings });

    await db.set('nodemcu1.sensor', JSON.stringify(readings));
    await updateReport();
  },

  [topics.wemos1.result]: async (payload) => {
    const data = JSON.parse(payload.toString());
    const hexCode = (data && data.IrReceived && data.IrReceived.Data) || null;
    if (hexCode) {
      ir.receive(hexCode);
    }
  },

  [topics.wemos1.switch1]: async (payload) => {
    await updateDeviceState('wemos1.switch1', payload);
    await turnOnDeskLampIfNeeded();
    await updateReport();
  },

  [topics.wemos1.switch2]: async (payload) => {
    await updateDeviceState('wemos1.switch2', payload);
    await turnOnDeskLampIfNeeded();
    await updateReport();
  },

  [topics.wemos1.switch3]: async (payload) => {
    const state = payload.toString();
    if (state === '1') {
      clearDisplay();
      displayNextState();
      resetIn10Secs();
    }
  },

  // simulate Tuya-Tasmota device
  [topics.bulb1.cmnd()]: smartBulbCmndParser('bulb1'),

  [topics.bulb2.cmnd()]: smartBulbCmndParser('bulb2'),
};

module.exports = parsers;
