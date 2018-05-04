const mqtt = require('mqtt');
const feels = require('feels');
const { getWeather } = require('./util');

const devices = {
  patio: {
    stat: 'stat/sonoff-patio/POWER',
    cmnd: 'cmnd/sonoff-patio/power'
  },
  heater: {
    stat: 'stat/sonoff-heater/POWER',
    sensor: 'tele/sonoff-heater/SENSOR',
    cmnd: 'cmnd/sonoff-heater/power'
  }
};

const client = mqtt.connect(process.env.CLOUDMQTT_URL);

client.on('connect', () => {
  console.log('mqtt client connected');

  client.subscribe(devices.patio.stat);
  client.subscribe(devices.heater.stat);
  client.subscribe(devices.heater.sensor);

  client.on('message', async (topic, payload) => {
    console.log(`message for topic "${topic}":`, payload);

    if (topic === devices.heater.sensor) {
      try {
        const data = JSON.parse(payload);
        const temperature = parseFloat(data.DS18B20.Temperature) || null;
        const humidity = await getWeather() || 50;
        const realFeel = feels.humidex(temperature, humidity);

        console.log('temperature', temperature);
        console.log('humidity', humidity);
        console.log('realFeel', realFeel);

        if (realFeel < 22) {
          console.log('Turning device on...');
          client.publish(devices.heater.cmnd, '1');
        }
        if (realFeel > 22.5) {
          console.log('Turning device off...');
          client.publish(devices.heater.cmnd, '0');
        }
      } catch (err) {
        console.error('telemetry payload parsing error:', err);
      }
    }
  });
});

client.on('close', () => {
  console.log('mqtt client disconnected');
});

module.exports = client;
