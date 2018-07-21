const topics = {
  report: 'stat/_report',
  heater: {
    stat: `stat/sonoff-heater/POWER`,
    cmnd: `cmnd/sonoff-heater/power`,
    sensor: `tele/sonoff-heater/SENSOR`,
  },
  heater2: {
    stat: `stat/sonoff-heater2/POWER`,
    cmnd: `cmnd/sonoff-heater2/power`,
  },
  wemos1: {
    stat: `stat/wemos/POWER`,
    cmnd: `cmnd/wemos/POWER`,
    sensor: `tele/wemos/SENSOR`,
    result: `tele/wemos/RESULT`,
  }
};

module.exports = topics;
