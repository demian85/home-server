const db = require('./db');
const utils = require('./utils');

jest.mock('./db');

describe('getHeatingDeviceForRoom()', () => {
  db.getDeviceTelemetryData.mockResolvedValue({
    Time: '2020-06-15T17:28:43',
    Uptime: '0T15:28:11',
    UptimeSec: 55691,
    Heap: 26,
    SleepMode: 'Dynamic',
    Sleep: 50,
    LoadAvg: 19,
    MqttCount: 1,
    POWER: 'OFF',
    Wifi: {
      AP: 1,
      SSId: 'Garchatel WiFi',
      BSSId: 'CC:2D:E0:A6:11:71',
      Channel: 4,
      RSSI: 90,
      Signal: -20,
      LinkCount: 1,
      Downtime: '0T00:00:06',
    },
  });

  it('should return "mobileHeater"', async () => {
    const out = await utils.getHeatingDeviceForRoom('mobileHeater');

    expect(out).toBe('mobileHeater');
  });

  it('should return null', async () => {
    const out = await utils.getHeatingDeviceForRoom(null);

    expect(out).toBe(null);
  });

  it('should return null', async () => {
    const out = await utils.getHeatingDeviceForRoom({
      name: 'heater1',
      conditions: { 'Wifi.RSSI': { $gt: 90 } },
    });

    expect(out).toBe(null);
  });

  it('should return null', async () => {
    const out = await utils.getHeatingDeviceForRoom({
      name: 'heater1',
      conditions: { 'Wifi.RSSI': { $lt: 90 } },
    });

    expect(out).toBe(null);
  });

  it('should return null', async () => {
    const out = await utils.getHeatingDeviceForRoom({
      name: 'heater1',
      conditions: { 'Wifi.RSSI': { $gte: 91, $lte: 95 } },
    });

    expect(out).toBe(null);
  });

  it('should return null', async () => {
    const out = await utils.getHeatingDeviceForRoom({
      name: 'heater1',
      conditions: { 'Wifi.Signal': { $lt: -18 }, 'Wifi.RSSI': { $gt: 95 } },
    });

    expect(out).toBe(null);
  });

  it('should return "heater1"', async () => {
    const out = await utils.getHeatingDeviceForRoom({
      name: 'heater1',
      conditions: { 'Wifi.RSSI': { $gte: 90 } },
    });

    expect(out).toBe('heater1');
  });

  it('should return "heater1"', async () => {
    const out = await utils.getHeatingDeviceForRoom({
      name: 'heater1',
      conditions: { 'Wifi.RSSI': { $gte: 85 } },
    });

    expect(out).toBe('heater1');
  });

  it('should return "heater1"', async () => {
    const out = await utils.getHeatingDeviceForRoom({
      name: 'heater1',
      conditions: { 'Wifi.RSSI': { $lte: 92 } },
    });

    expect(out).toBe('heater1');
  });

  it('should return "heater1"', async () => {
    const out = await utils.getHeatingDeviceForRoom({
      name: 'heater1',
      conditions: { 'Wifi.RSSI': { $gte: 50, $lte: 95 } },
    });

    expect(out).toBe('heater1');
  });

  it('should return "heater1"', async () => {
    const out = await utils.getHeatingDeviceForRoom({
      name: 'heater1',
      conditions: { 'Wifi.RSSI': { $eq: 90 } },
    });

    expect(out).toBe('heater1');
  });

  it('should return "heater1"', async () => {
    const out = await utils.getHeatingDeviceForRoom({
      name: 'heater1',
      conditions: { 'Wifi.Signal': { $lt: -18 } },
    });

    expect(out).toBe('heater1');
  });

  it('should return "heater1"', async () => {
    const out = await utils.getHeatingDeviceForRoom({
      name: 'heater1',
      conditions: { 'Wifi.Signal': { $lt: -18 }, 'Wifi.RSSI': { $gt: 50 } },
    });

    expect(out).toBe('heater1');
  });
});
