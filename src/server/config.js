module.exports = {
  rooms: {
    livingRoom: {
      source: {
        device: 'wemos1',
        sensor: 'AM2301',
      },
      heatingDevice: null, // null means dynamic based on function getHeatingDeviceForRoom()
      defaultSetPoint: 20,
      autoMode: true,
      threshold: 0.3,
      tempGroups: [
        { start: 0, end: 7, temp: 10 },
        { start: 7, end: 10, temp: 20 },
        { start: 10, end: 18, temp: 18 },
        { start: 18, end: 24, temp: 20 },
      ],
    },
    bigRoom: {
      source: {
        device: 'nodemcu1',
        sensor: 'AM2301',
      },
      heatingDevice: null,
      defaultSetPoint: 20,
      autoMode: true,
      threshold: 0.3,
      tempGroups: [
        { start: 0, end: 4, temp: 20.5 },
        { start: 4, end: 9, temp: 20.7 },
        { start: 9, end: 18, temp: 15 },
        { start: 18, end: 24, temp: 20 },
      ],
    },
    smallRoom: {
      source: {
        device: 'heaterPanel',
        sensor: 'SI7021',
      },
      heatingDevice: 'heaterPanel',
      defaultSetPoint: 20,
      autoMode: true,
      threshold: 0.3,
      tempGroups: [
        { start: 0, end: 4, temp: 21.8 },
        { start: 4, end: 9, temp: 22 },
        { start: 9, end: 18, temp: 15 },
        { start: 18, end: 24, temp: 21.5 },
      ],
    },
    bathRoom: {
      source: {
        device: 'heaterPanel',
        sensor: 'SI7021',
      },
      heatingDevice: 'bathroomHeaterPanel',
      defaultSetPoint: 20,
      autoMode: true,
      threshold: 0.3,
      tempGroups: [
        { start: 0, end: 4, temp: 21.8 },
        { start: 4, end: 9, temp: 22 },
        { start: 9, end: 18, temp: 15 },
        { start: 18, end: 24, temp: 21.5 },
      ],
    },
  },
  minStateDurationSecs: 60 * 5,
  autoTurnOffDeskLamp: true,
  autoTurnOffDeskLampDelay: 30, // in seconds
  autoTurnOnDeskLamp: true,
  nightTime: null,
  bedTime: '23:00',
};
