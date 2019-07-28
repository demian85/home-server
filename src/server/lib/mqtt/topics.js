const topics = {
  report: 'stat/_report',
  heater1: {
    lwt: `tele/sonoff-heater/LWT`,
    cmnd: (cmnd = 'power') => `cmnd/sonoff-heater/${cmnd}`,
    stat: `stat/sonoff-heater/POWER`,
    sensor: `tele/sonoff-heater/SENSOR`,
  },
  heater2: {
    lwt: `tele/sonoff-heater2/LWT`,
    cmnd: (cmnd = 'power') => `cmnd/sonoff-heater2/${cmnd}`,
    stat: `stat/sonoff-heater2/POWER`,
    sensor: `tele/sonoff-heater2/SENSOR`,
  },
  roomLamp: {
    cmnd: (cmnd = 'power') => `cmnd/sonoff-lamp/${cmnd}`,
    stat: `stat/sonoff-lamp/POWER`,
  },
  deskLamp: {
    cmnd: (cmnd = 'power') => `cmnd/sonoff-desk-lamp/${cmnd}`,
    stat: `stat/sonoff-desk-lamp/POWER`,
  },
  bathroom: {
    cmnd: (cmnd = 'power') => `cmnd/sonoff-bathroom/${cmnd}`,
    stat: `stat/sonoff-bathroom/POWER`,
  },
  wemos1: {
    cmnd: (cmnd = 'POWER') => `cmnd/wemos/${cmnd}`,
    stat: `stat/wemos/POWER`,
    sensor: `tele/wemos/SENSOR`,
    result: `tele/wemos/RESULT`,
    switch1: 'stat/wemos/SWITCH1',
    switch2: 'stat/wemos/SWITCH2',
    switch3: 'stat/wemos/SWITCH3',
  },
  nodemcu1: {
    cmnd: (cmnd = 'POWER') => `cmnd/nodemcu/${cmnd}`,
    stat: `stat/nodemcu/POWER`,
    sensor: `tele/nodemcu/SENSOR`,
    result: `tele/nodemcu/RESULT`,
  },
  bulb1: {
    cmnd: (cmnd = 'POWER') => `cmnd/bulb1/${cmnd}`,
    stat: `stat/bulb1/POWER`,
  },
  bulb2: {
    cmnd: (cmnd = 'POWER') => `cmnd/bulb2/${cmnd}`,
    stat: `stat/bulb2/POWER`,
  },
};

module.exports = topics;
