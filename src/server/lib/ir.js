const mqttClient = require('./mqtt/client');

const parsers = {
  FF30CF: () => {
    // 1
    return mqttClient.publish('cmnd/sonoff-desk-lamp/POWER', 'TOGGLE');
  },
  FF18E7: () => {
    // 2
    return mqttClient.publish('cmnd/sonoff-patio/POWER', 'TOGGLE');
  },
};

function receive(code) {
  const parser = parsers[code];

  if (parser) {
    parser();
  }
}

exports.receive = receive;
