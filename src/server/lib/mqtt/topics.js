const topics = {
  report: 'stat/_report',
  heaterPanel: {
    lwt: `tele/sonoff-heater-panel/LWT`,
    cmnd: (cmnd = 'power') => `cmnd/sonoff-heater-panel/${cmnd}`,
    stat: `stat/sonoff-heater-panel/POWER`,
    sensor: `tele/sonoff-heater-panel/SENSOR`,
  },
  deskLamp: {
    cmnd: (cmnd = 'power') => `cmnd/sonoff-flame-lamp/${cmnd}`,
    stat: `stat/sonoff-flame-lamp/POWER`,
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
  laundry: {
    cmnd: (cmnd = 'POWER') => `cmnd/wemos-laundry/${cmnd}`,
    stat: `stat/wemos-laundry/POWER`,
    sensor: `tele/wemos-laundry/SENSOR`,
    result: `tele/wemos-laundry/RESULT`,
  },
  mobileHeater: {
    cmnd: (cmnd = 'power') => `cmnd/sonoff-mobile-heater/${cmnd}`,
    stat: `stat/sonoff-mobile-heater/POWER`,
  },
};

module.exports = topics;
