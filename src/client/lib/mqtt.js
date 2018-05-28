import mqtt from 'mqtt';

const topics = {
  heater: {
    stat: `stat/sonoff-heater/POWER`,
    cmnd: `cmnd/sonoff-heater/power`,
    sensor: `tele/sonoff-heater/SENSOR`,
  }
};

const parsers = {

  [topics.heater.stat]: async (payload) => {
    const on = String(payload).toLowerCase() === 'on';
    const lastChange = Date.now();
    console.debug('state data:', { on, lastChange });
  }
};

export function initMqttClient() {
  console.info('initializing mqtt client...');

  const client = mqtt.connect(localStorage.mqttUrl);

  client.on('connect', () => {
    console.info('mqtt client connected');

    client.subscribe([
      topics.heater.stat,
      topics.heater.sensor
    ]);
  });

  client.on('message', async (topic, payload) => {
    console.debug(`message for topic "${topic}":`, payload.toString());

    const parser = parsers[topic];

    if (parser) {
      try {
        await parser(payload);
      } catch (err) {
        console.error('unexpected error parsing payload for topic', topic);
        throw err;
      }
    }
  });

  client.on('close', () => {
    console.info('mqtt client disconnected');
  });

  client.on('error', (err) => {
    console.error('mqtt client error:', err);
  });

  return client;
}
