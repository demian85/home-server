const parsers = {
  'FF30CF': async (mqttClient) => {
    // 1
    mqttClient.publish('cmnd/sonoff-desk-lamp/POWER', 'TOGGLE');
  }
};

async function receive(mqttClient, code) {
  const parser = parsers[code];

  if (parser) {
    await parser(mqttClient);
  }
}

exports.receive = receive;
