const mqtt = require('mqtt');

const client = mqtt.connect(process.env.MQTT_URL, {
  clean: true,
});

module.exports = client;
