class Device {
  constructor(name, state = 'off') {
    this.name = name;
    this.state = state;
    this.lastStateChange = Date.now();
    this.topics = {
      stat: `stat/${this.name}/POWER`,
      cmnd: `cmnd/${this.name}/power`,
      sensor: `tele/${this.name}/SENSOR`
    };
  }

  isOn() {
    return this.state === 'on';
  }

  setState(state) {
    this.state = state;
  }
}

exports.patio = new Device('sonoff-patio');
exports.heater = new Device('sonoff-heater');
