const mqtt = require('mqtt');

const client = mqtt.connect(process.env.MQTT_URL);

module.exports = client;
