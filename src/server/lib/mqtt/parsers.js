const logger = require('winston');

const topics = require('./topics');
const db = require('../db');
const { updateHeaterState, updateReport, getRealFeel } = require('../main');
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
    const temperature = parseFloat(data.SI7021.Temperature) || null; // can't be 0, sorry!
    const humidity = parseFloat(data.SI7021.Humidity) || null; // 0% humidity would be nice!
    const realFeel = getRealFeel(temperature, humidity);

    const { autoMode } = await db.getHeaterConfig();

    logger.debug('Saving sensor data:', { temperature, humidity, realFeel });

    await db.set('heater.sensor', JSON.stringify({ temperature, humidity, realFeel }));

    if (autoMode) {
      await updateHeaterState();
    }

    await updateReport();
  },

  [topics.wemos1.sensor]: async (payload) => {
    const data = JSON.parse(payload);
    const temperature = parseFloat(data.AM2301.Temperature) || null;
    const humidity = parseFloat(data.AM2301.Humidity) || null;
    const realFeel = getRealFeel(temperature, humidity);

    logger.debug('Saving sensor data:', { temperature, humidity, realFeel });

    await db.set('wemos1.sensor', JSON.stringify({ temperature, humidity, realFeel }));

    await updateReport();
  },

  [topics.wemos1.result]: async (payload) => {
    const data = JSON.parse(payload);
    const hexCode = data && data.IrReceived && data.IrReceived.Data || null;
    await ir.receive(hexCode);
  }
};

module.exports = parsers;
