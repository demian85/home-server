const topics = {
  report: 'stat/_report',
  heater: {
    stat: `stat/sonoff-heater/POWER`,
    cmnd: `cmnd/sonoff-heater/power`,
    sensor: `tele/sonoff-heater/SENSOR`,
  },
  wemos1: {
    stat: `stat/wemos/POWER`,
    cmnd: `cmnd/wemos/POWER`,
    sensor: `tele/wemos/SENSOR`,
  }
};

module.exports = topics;
