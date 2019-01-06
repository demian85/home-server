import mqtt from 'mqtt';

export function initMqttClient(parsers = {}) {
  console.info('initializing mqtt client...');

  const client = mqtt.connect(localStorage.mqttUrl);

  client.on('connect', () => {
    console.info('mqtt client connected');

    client.subscribe(['stat/#', 'cmnd/#', 'tele/+/SENSOR', 'tele/+/LWT']);
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
