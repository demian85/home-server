const logger = require('../logger');
const topics = require('./topics');
const db = require('../db');
const { updateDeviceState, updateDeviceLedPower, updateHeaterState, updateReport, getSensorReadings } = require('../main');
const ir = require('../ir');

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

  [topics.heater1.sensor]: async (payload) => {
    const data = JSON.parse(payload.toString());
    const readings = getSensorReadings(data, 'SI7021');

    if (!readings) {
      return logger.error('Sensor SI7021 not found!');
    }

    logger.debug('Saving heater sensor data: %j', readings);

    await db.set('heater1.sensor', JSON.stringify(readings));
    const { autoMode } = await db.getHeaterConfig();
    if (autoMode) {
      await updateHeaterState();
    }
    await updateReport();
  },

  [topics.wemos1.sensor]: async (payload) => {
    const data = JSON.parse(payload.toString());
    const readings = getSensorReadings(data, 'AM2301');

    if (!readings) {
      return logger.error('Sensor AM2301 not found!');
    }

    logger.debug('Saving wemos1 sensor data: %j', readings);

    await db.set('wemos1.sensor', JSON.stringify(readings));
    await updateReport();
  },

  [topics.wemos1.result]: async (payload) => {
    const data = JSON.parse(payload.toString());
    const hexCode = data && data.IrReceived && data.IrReceived.Data || null;
    if (hexCode) {
      ir.receive(hexCode);
    }
  },

  [topics.wemos1.cmnd()]: async (payload) => {
    await updateDeviceState('wemos1', payload);
    await updateReport();
  },

  [topics.heater1.statResult]: async (payload) => {
    await updateDeviceLedPower('heater1', payload);
  },

  [topics.heater2.statResult]: async (payload) => {
    await updateDeviceLedPower('heater2', payload);
  },

  [topics.deskLamp.statResult]: async (payload) => {
    await updateDeviceLedPower('deskLamp', payload);
  },

  [topics.roomLamp.statResult]: async (payload) => {
    await updateDeviceLedPower('roomLamp', payload);
  },
};

module.exports = parsers;
