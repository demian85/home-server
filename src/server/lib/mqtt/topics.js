const topics = {
  report: 'stat/_report',
  heater1: {
    cmnd: (cmnd = 'power') => `cmnd/sonoff-heater/${cmnd}`,
    stat: `stat/sonoff-heater/POWER`,
    statResult: 'stat/sonoff-heater/RESULT',
    sensor: `tele/sonoff-heater/SENSOR`,
  },
  heater2: {
    cmnd: (cmnd = 'power') => `cmnd/sonoff-heater2/${cmnd}`,
    stat: `stat/sonoff-heater2/POWER`,
    statResult: 'stat/sonoff-heater2/RESULT',
  },
  roomLamp: {
    cmnd: (cmnd = 'power') => `cmnd/sonoff-lamp/${cmnd}`,
    stat: `stat/sonoff-lamp/POWER`,
    statResult: 'stat/sonoff-lamp/RESULT',
  },
  deskLamp: {
    cmnd: (cmnd = 'power') => `cmnd/sonoff-desk-lamp/${cmnd}`,
    stat: `stat/sonoff-desk-lamp/POWER`,
    statResult: 'stat/sonoff-desk-lamp/RESULT',
  },
  wemos1: {
    cmnd: (cmnd = 'POWER') => `cmnd/wemos/${cmnd}`,
    stat: `stat/wemos/POWER`,
    sensor: `tele/wemos/SENSOR`,
    result: `tele/wemos/RESULT`,
    switch1: 'stat/wemos/SWITCH1',
    switch2: 'stat/wemos/SWITCH2',
  },
  nodemcu1: {
    cmnd: (cmnd = 'POWER') => `cmnd/nodemcu/${cmnd}`,
    stat: `stat/nodemcu/POWER`,
    sensor: `tele/nodemcu/SENSOR`,
    result: `tele/nodemcu/RESULT`,
  },
};

module.exports = topics;
