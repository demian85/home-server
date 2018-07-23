import React from 'react';
import { Route } from 'react-router-dom';
import { store, Provider } from '../lib/store';
import { initMqttClient } from '../lib/mqtt';

import Home from './Home';
import Config from './Config';
import Loader from './Loader';

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = Object.assign({}, store, {
      cmnd: async (device, value) => {
        console.log('cmnd', device, value);
        this.state.mqttClient.publish(`cmnd/${device}/power`, String(value));
      },
      setConfig: async (key, value) => {
        console.log('setConfig', key, value);
        const newValues = key ? { [key]: value } : {};
        const body = JSON.stringify(Object.assign({}, this.state.config, newValues));
        const res = await fetch('/api/config', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body
        });
        const newConfig = await res.json();
        this.setState({ config: newConfig });
      },
      manualHeaterSwitch: async (n, value) => {
        await this.state.cmnd(`sonoff-heater${n}`, value ? '1' : '0');
        await this.state.setConfig('autoMode', false);
      }
    });
  }

  async componentDidMount() {
    const res = await fetch('/init', { credentials: 'include' });
    const { report, config, auth } = await res.json();

    localStorage.apiKey = auth.apiKey;
    localStorage.mqttUrl = auth.mqttUrl;

    const mqttClient = initMqttClient({
      'stat/sonoff-heater/POWER': this.buildStatusParser('heater'),
      'stat/sonoff-heater2/POWER': this.buildStatusParser('heater2'),
      'stat/sonoff-lamp/POWER': this.buildStatusParser('lamp'),
      'stat/sonoff-desk-lamp/POWER': this.buildStatusParser('desk-lamp'),
      'stat/sonoff-patio/POWER': this.buildStatusParser('patio'),
      'cmnd/wemos/POWER': this.buildStatusParser('wemos'),
      'stat/_report': (payload) => {
        const report = JSON.parse(payload);
        this.setState({ report });
      }
    });

    mqttClient.on('connect', () => {
      this.setState({ loaded: true });
    });

    mqttClient.on('close', () => {
      this.setState({ loaded: false });
    });

    this.setState({ mqttClient, report, config, auth });
  }

  render() {
    if (!this.state.loaded) {
      return <Loader />;
    }
    return (
      <Provider value={this.state}>
        <Route exact path="/" render={() => <Home />} />
        <Route path="/config" render={() => <Config value={this.state.config} />} />
      </Provider>
    );
  }

  buildStatusParser(deviceName) {
    return (payload) => {
      const status = String(payload).toLowerCase();
      this.setState((state) => {
        return {
          status: Object.assign({}, state.status, { [deviceName]: status })
        };
      });
    };
  }

}
