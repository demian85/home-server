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
  autoTurnOffDeskLamp: false,
  autoTurnOffDeskLampDelay: 60, // in seconds
  autoTurnOnDeskLamp: false,
  nightTime: null,
  bedTime: '23:00',
};
