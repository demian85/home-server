module.exports = {
  defaultSetPoint: 20,
  minStateDurationSecs: 60 * 5,
  autoMode: true,
  trigger: 'temp',
  tempGroups: [
    { start: 0, end: 4, temp: 21 },
    { start: 4, end: 9, temp: 21.2 },
    { start: 9, end: 18, temp: 19 },
    { start: 18, end: 24, temp: 20.5 },
  ],
  autoLedPower: {
    heater1: 0,
    heater2: 0,
    roomLamp: 0,
    deskLamp: 0,
  },
  autoTurnOffDeskLamp: false,
};
