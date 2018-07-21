const logger = require('winston');

const topics = require('./topics');
const db = require('../db');
const { updateHeaterState, updateReport, getRealFeel, getSensorReadings } = require('../main');
const ir = require('../ir');

const parsers = {

  [topics.heater.stat]: async (payload) => {
    const on = String(payload).toLowerCase() === 'on';
    const lastChange = Date.now();
    logger.debug('Saving state data:', { on, lastChange });
    await db.set('heater.state', JSON.stringify({ on, lastChange }));
  },

  [topics.heater.sensor]: async (payload) => {
    const data = JSON.parse(payload);
    const readings = getSensorReadings(data, 'SI7021');

    if (!readings) {
      return logger.error('Sensor SI7021 not found!');
    }

    logger.debug('Saving heater sensor data:', readings);

    await db.set('heater.sensor', JSON.stringify(readings));

    const { autoMode } = await db.getHeaterConfig();

    if (autoMode && process.env.NODE_ENV !== 'development') {
      await updateHeaterState();
    }

    await updateReport();
  },

  [topics.wemos1.sensor]: async (payload) => {
    const data = JSON.parse(payload);

    const readings = getSensorReadings(data, 'AM2301');

    if (!readings) {
      return logger.error('Sensor AM2301 not found!');
    }

    logger.debug('Saving wemos1 sensor data:', readings);

    await db.set('wemos1.sensor', JSON.stringify(readings));

    await updateReport();
  },

  [topics.wemos1.result]: async (payload) => {
    const data = JSON.parse(payload);
    const hexCode = data && data.IrReceived && data.IrReceived.Data || null;
    if (hexCode) {
      ir.receive(hexCode);
    }
  }
};

module.exports = parsers;
