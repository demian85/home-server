export const devices = {
  heater: {
    topics: {
      power: 'cmnd/sonoff-heater/power',
      status: 'stat/sonoff-heater/POWER',
      sensor: 'tele/sonoff-heater/SENSOR',
      lwt: 'tele/sonoff-heater/LWT',
    },
    ipAddress: '192.168.0.16',
    power: null,
    online: null,
  },
  saltLamp: {
    topics: {
      power: 'cmnd/sonoff-salt-lamp/power',
      status: 'stat/sonoff-salt-lamp/POWER',
      lwt: 'tele/sonoff-salt-lamp/LWT',
    },
    ipAddress: '192.168.0.14',
    power: null,
    online: null,
  },
  flameLamp: {
    topics: {
      power: 'cmnd/sonoff-flame-lamp/power',
      status: 'stat/sonoff-flame-lamp/POWER',
      lwt: 'tele/sonoff-flame-lamp/LWT',
    },
    ipAddress: '192.168.0.17',
    power: null,
    online: null,
  },
  heaterLight: {
    topics: {
      power: 'cmnd/sonoff-heater-light/power',
      status: 'stat/sonoff-heater-light/POWER',
      lwt: 'tele/sonoff-heater-light/LWT',
    },
    ipAddress: '192.168.0.24',
    power: null,
    online: null,
  },
  laundryLamp: {
    topics: {
      power: 'shellies/shelly-laundry-lamp/relay/0/command',
      status: 'shellies/shelly-laundry-lamp/relay/0',
      lwt: 'shellies/shelly-laundry-lamp/relay/0/online',
    },
    ipAddress: '192.168.0.13',
    power: null,
    online: null,
  },
  poolPump: {
    topics: {
      power: 'cmnd/sonoff-pool-pump/power',
      status: 'stat/sonoff-pool-pump/POWER',
      lwt: 'tele/sonoff-pool-pump/LWT',
    },
    ipAddress: '192.168.0.31',
    power: null,
    online: null,
  },
  bathroom: {
    topics: {
      power: 'cmnd/sonoff-bathroom/power',
      status: 'stat/sonoff-bathroom/POWER',
      lwt: 'tele/sonoff-bathroom/LWT',
    },
    ipAddress: '192.168.0.34',
    power: null,
    online: null,
  },
};
