const topics = {
  report: 'stat/_report',
  heater: {
    stat: `stat/sonoff-heater/POWER`,
    cmnd: `cmnd/sonoff-heater/power`,
    sensor: `tele/sonoff-heater/SENSOR`,
  }
};

module.exports = topics;
