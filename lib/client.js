const mqtt = require('mqtt');

const devices = {
  desk: {
    stat: 'stat/sonoff-desk/power',
    cmnd: 'cmnd/sonoff-desk/power'
  }
};

const client = mqtt.connect(process.env.CLOUDMQTT_URL);

client.on('connect', function () {
  console.log('mqtt client connected');

  client.subscribe(devices.desk.stat);

  client.on('message', (topic, payload) => {
    if (topic === devices.desk.stat) {
      console.log('status changed:', payload);
    }
  });
});

client.on('close', () => {
  console.log('mqtt client disconnected');
});

module.exports = client;
