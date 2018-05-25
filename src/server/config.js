module.exports = {
  heater: {
    defaultTriggerTemp: 23,
    minStateDurationSecs: 60 * 15,
    autoMode: false,
    tempGroups: [
      { start: 0, end: 9, temp: 23 },
      { start: 9, end: 18, temp: 22 },
      { start: 18, end: 24, temp: 23 },
    ]
  }
};
