const logger = require('../logger');
const topics = require('./topics');
const db = require('../db');
const {
  updateDeviceOnlineStatus,
  updateDeviceState,
  updateHeaterState,
  updateReport,
  getSensorReadings,
} = require('../main');
const { turnOnDeskLampIfNeeded } = require('../actions');

const parsers = {
  [topics.heaterPanel.stat]: async (payload) => {
    await updateDeviceState('heaterPanel', payload);
  },

  [topics.heaterPanel.lwt]: async (payload) => {
    await updateDeviceOnlineStatus('heaterPanel', payload);
  },

  [topics.deskLamp.stat]: async (payload) => {
    await updateDeviceState('deskLamp', payload);
  },

  [topics.bathroom.stat]: async (payload) => {
    await updateDeviceState('bathroom', payload);
  },

  [topics.heaterPanel.sensor]: async (payload) => {
    const data = JSON.parse(payload.toString());
    const SI7021 = getSensorReadings(data, 'SI7021');

    if (!SI7021) {
      return logger.error('Sensor SI7021 not found!');
    }

    const readings = { SI7021 };

    logger.debug('Saving heater sensor readings: %j', readings);

    await db.set('heaterPanel.sensor', JSON.stringify(readings));
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

    logger.debug('Saving sensor readings: %j', readings);

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

    logger.debug('Saving sensor readings: %j', { readings });

    await db.set('nodemcu1.sensor', JSON.stringify(readings));
    await updateReport();
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

  [topics.laundry.sensor]: async (payload) => {
    const data = JSON.parse(payload.toString());
    const DS18B20 = getSensorReadings(data, 'DS18B20');

    if (!DS18B20) {
      logger.error('Sensor DS18B20 not found!');
    }

    const readings = { DS18B20 };

    logger.debug('Saving sensor readings: %j', readings);

    await db.set('laundry.sensor', JSON.stringify(readings));
    await updateReport();
  },
};

module.exports = parsers;
