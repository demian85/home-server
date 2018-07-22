const logger = require('winston');

const topics = require('./topics');
const db = require('../db');
const { updateHeaterState, updateReport, getSensorReadings } = require('../main');
const ir = require('../ir');

const parsers = {

  [topics.heater1.stat]: async (payload) => {
    const on = String(payload).toLowerCase() === 'on';
    const lastChange = Date.now();
    logger.debug('Saving heater1 state data:', { on, lastChange });
    await db.set('heater1.state', JSON.stringify({ on, lastChange }));
  },

  [topics.heater2.stat]: async (payload) => {
    const on = String(payload).toLowerCase() === 'on';
    const lastChange = Date.now();
    logger.debug('Saving heater2 state data:', { on, lastChange });
    await db.set('heater2.state', JSON.stringify({ on, lastChange }));
  },

  [topics.heater1.sensor]: async (payload) => {
    const data = JSON.parse(payload);
    const readings = getSensorReadings(data, 'SI7021');

    if (!readings) {
      return logger.error('Sensor SI7021 not found!');
    }

    logger.debug('Saving heater sensor data:', readings);

    await db.set('heater1.sensor', JSON.stringify(readings));

    const { autoMode } = await db.getHeaterConfig();

    if (autoMode) {
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
