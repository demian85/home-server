module.exports = {
  heater: {
    defaultTriggerTemp: 23,
    minStateDurationSecs: 60 * 15,
    autoMode: false,
    tempGroups: [
      { start: 0, end: 4, temp: 23.1 },
      { start: 4, end: 9, temp: 23.3 },
      { start: 9, end: 18, temp: 22.5 },
      { start: 18, end: 24, temp: 22.8 },
    ]
  }
};
