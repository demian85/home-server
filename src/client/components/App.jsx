import React from 'react';
import { Route } from 'react-router-dom';
import { store, Provider } from '../lib/store';
import { initMqttClient } from '../lib/mqtt';

import Home from './Home';
import Config from './Config';

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = Object.assign({}, store, {
      cmnd: async (device, value) => {
        console.log('cmnd', device, value);
        this.state.mqttClient.publish(`cmnd/${device}/power`, value);
      },
      setConfig: async (key, value) => {
        console.log('setConfig', key, value);
        const newValues = key ? { [key]: value } : {};
        const body = JSON.stringify(Object.assign({}, this.state.config, newValues));
        const res = await fetch('/api/config', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.state.auth.apiKey
          },
          body
        });
        const newConfig = await res.json();
        this.setState({ config: newConfig });
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
      'stat/sonoff-lamp/POWER': this.buildStatusParser('lamp'),
      'stat/sonoff-patio/POWER': this.buildStatusParser('patio'),
      'stat/_report': (payload) => {
        const report = JSON.parse(payload);
        this.setState({ report });
      }
    });

    this.setState({
      loaded: true,
      mqttClient,
      report,
      config,
      auth
    });
  }

  render() {
    return (
      <section>
        <Provider value={this.state}>
          {
            !this.state.loaded && <div>Loading...</div>
          }
          <Route exact path="/" render={() => <Home />} />
          <Route path="/config" render={() => <Config />} />
        </Provider>
      </section>
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
