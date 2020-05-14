module.exports = {
  rooms: {
    livingRoom: {
      source: {
        device: 'wemos1',
        sensor: 'AM2301',
      },
      heatingDevice: 'mobileHeater',
      defaultSetPoint: 20,
      autoMode: true,
      threshold: 0.3,
      tempGroups: [
        { start: 0, end: 7, temp: 17 },
        { start: 7, end: 10, temp: 20 },
        { start: 10, end: 18, temp: 18 },
        { start: 18, end: 24, temp: 20 },
      ],
    },
    bigRoom: {
      source: {
        device: 'nodemcu',
        sensor: 'AM2301',
      },
      heatingDevice: null,
      defaultSetPoint: 20,
      autoMode: true,
      threshold: 0.3,
      tempGroups: [
        { start: 0, end: 4, temp: 21.7 },
        { start: 4, end: 9, temp: 21.9 },
        { start: 9, end: 18, temp: 17 },
        { start: 18, end: 24, temp: 21.5 },
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
        { start: 4, end: 9, temp: 21.9 },
        { start: 9, end: 18, temp: 17 },
        { start: 18, end: 24, temp: 21.7 },
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
        { start: 4, end: 9, temp: 21.9 },
        { start: 9, end: 18, temp: 17 },
        { start: 18, end: 24, temp: 21.7 },
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
