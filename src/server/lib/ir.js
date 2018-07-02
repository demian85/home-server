const mqttClient = require('./mqtt/client');

const parsers = {
  'FF30CF': async () => {
    // 1
    return mqttClient.publish('cmnd/sonoff-desk-lamp/POWER', 'TOGGLE');
  }
};

async function receive(code) {
  const parser = parsers[code];

  if (parser) {
    await parser();
  }
}

exports.receive = receive;
