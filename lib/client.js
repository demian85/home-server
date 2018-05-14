const mqtt = require('mqtt');
const Feels = require('feels');
const logger = require('winston');
const { getWeather } = require('./weather');

const state = {
  heater: {
    auto: true,
    state: 'off',
    triggerTemp: 22,
    minStateDurationSecs: 60 * 15,
    lastStateChange: Date.now(),
    temperature: null,
    humidity: null
  },
  presence: true
};

const topics = {
  _report: 'report',
  heater: {
    stat: `stat/sonoff-heater/POWER`,
    cmnd: `cmnd/sonoff-heater/power`,
    sensor: `tele/sonoff-heater/SENSOR`,
  }
};

const client = initMqttClient();

const parsers = {

  'config/heater_trigger_temp': (payload) => {
    const value = parseFloat(payload);
    state.heater.triggerTemp = value;
    updateHeaterState();
  },

  'config/heater_auto': (payload) => {
    const value = (payload == '1');
    state.heater.auto = value;
    updateHeaterState();
  },

  'config/presence': (payload) => {
    const value = (payload == '1');
    state.presence = value;
    updateHeaterState();
  },

  [topics.heater.sensor]: (payload) => {
    const data = JSON.parse(payload);
    const temperature = parseFloat(data.SI7021.Temperature) || null;
    const humidity = parseFloat(data.SI7021.Humidity) || null;

    state.heater.temperature = temperature;
    state.heater.humidity = humidity;

    if (state.heater.auto) {
      updateHeaterState();
    }

    updateCustomReport();
  },

  [topics.heater.stat]: (payload) => {
    state.heater.state = String(payload).toLowerCase();
    state.heater.lastStateChange = Date.now();
  },
};

function initMqttClient() {
  logger.info('initializing mqtt client...');

  const client = mqtt.connect(process.env.CLOUDMQTT_URL);

  client.on('connect', () => {
    logger.info('mqtt client connected');

    client.subscribe([
      'config/#',
      topics.heater.stat,
      topics.heater.sensor
    ]);

    client.on('message', async (topic, payload) => {
      logger.debug(`message for topic "${topic}":`, payload.toString());

      const parser = parsers[topic];

      if (parser) {
        try {
          parser(payload);
        } catch (err) {
          logger.error('unexpected error parsing payload for topic', topic);
          throw err;
        }
      }
    });
  });

  client.on('close', () => {
    logger.info('mqtt client disconnected');
  });

  client.on('error', (err) => {
    logger.error('mqtt client error:', err);
  });

  return client;
}

function getRoomRealFeel() {
  const { temperature, humidity } = state.heater;

  const feelsLike = new Feels({
    temp: temperature,
    humidity,
    speed: 0
  }).like();

  // Round to one decimal
  return Math.round(feelsLike * 10) / 10;
}

function updateHeaterState() {
  const { triggerTemp, state: heaterState, lastStateChange, temperature, humidity } = state.heater;

  if (temperature === null || humidity === null) {
    logger.error(`bad sensor readings! skipping...`, { temperature, humidity });
    return;
  }

  // calculate how long the device has been in this state
  const stateDurationSecs = Math.round((Date.now() - lastStateChange) / 1000);

  logger.debug(`last state change was ${stateDurationSecs} seconds ago`);

  // keep the same state for at least 15 minutes
  if (stateDurationSecs < state.heater.minStateDurationSecs) {
    logger.debug(`skipping...`);
    return;
  }

  const realFeel = getRoomRealFeel();

  if (heaterState === 'off' && realFeel < triggerTemp) {
    logger.debug('turning device on...');
    client.publish(topics.heater.cmnd, '1');
  }

  if (heaterState === 'on' && realFeel >= (triggerTemp + 0.5)) {
    logger.debug('turning device off...');
    client.publish(topics.heater.cmnd, '0');
  }
}

async function updateCustomReport() {
  const { temperature, humidity } = state.heater;
  const realFeel = getRoomRealFeel();

  let customReport = { temperature, humidity, realFeel };

    try {
      const weather = await getWeather();
      const temperatureDiff = Math.round((temperature - weather.main.temp) * 10) / 10;
      const humidityDiff = Math.round(humidity - weather.main.humidity);
      const tempDiffStr = temperatureDiff > 0 ? `+${temperatureDiff}` : String(temperatureDiff);
      const humDiffStr = humidityDiff > 0 ? `+${humidityDiff}` : String(humidityDiff);

      Object.assign(customReport, {
        temperatureDiff: tempDiffStr,
        humidityDiff: humDiffStr,
        weather: {
          temperature: weather.main.temp,
          humidity: weather.main.humidity,
          windSpeedKmh: Math.round(weather.wind.speed / 1000 * 3600)
        }
      });
    } catch (err) {
      logger.error('error parsing weather report');
    }

    logger.info('custom report:', customReport);

    client.publish(topics._report, JSON.stringify(customReport), { retain: true });
}

module.exports = client;
