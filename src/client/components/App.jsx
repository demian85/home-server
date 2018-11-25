import React from 'react';
import { Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { store, Provider } from '../lib/store';
import { initMqttClient } from '../lib/mqtt';

import Home from './Home';
import Config from './Config';
import Loader from './Loader';
import Log from './Log';

const devices = [
  'heater', 'heater2', 'lamp', 'desk-lamp', 'patio', 'socket1'
];

export default class App extends React.Component {

  static getDerivedStateFromError(error) {
    return { error };
  }

  constructor(props) {
    super(props);

    this.state = {
      ...store,
      cmnd: async (device, value) => {
        console.log('cmnd', device, value);
        this.state.mqttClient.publish(`cmnd/${device}/power`, String(value));
      },
      setConfig: async (values) => {
        console.log('setConfig', values);
        const body = JSON.stringify(Object.assign({}, this.state.config, values));
        await fetch('/api/config', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body
        });
      },
      manualHeaterSwitch: async (n, value) => {
        const deviceSuffix = n > 1 ? n : '';
        await this.state.cmnd(`sonoff-heater${deviceSuffix}`, value ? '1' : '0');
        await this.state.setConfig({ autoMode: false });
      }
    };
  }

  async componentDidMount() {
    const res = await fetch('/init', { credentials: 'include' });
    const { config, auth } = await res.json();

    localStorage.apiKey = auth.apiKey;
    localStorage.mqttUrl = auth.mqttUrl;

    const parsers = {};
    devices.forEach((name) => {
      parsers[`stat/sonoff-${name}/POWER`] = this.buildStatusParser(name);
      parsers[`tele/sonoff-${name}/LWT`] = this.buildOnlineStatusParser(name);
    });

    const mqttClient = initMqttClient({
      ...parsers,
      'cmnd/wemos/POWER': this.buildStatusParser('wemos'),
      'tele/wemos/LWT': this.buildOnlineStatusParser('wemos'),
      'stat/_report': (payload) => {
        const report = JSON.parse(payload);
        this.setState({ report });
      },
      'stat/_config': (payload) => {
        const config = JSON.parse(payload);
        this.setState({ config });
      },
      'stat/_logs': (payload) => {
        const data = JSON.parse(String(payload));
        this.setState((prevState) => {
          const logs = [...prevState.logs, data].slice(-500);
          return { logs };
        });
      },
    });

    mqttClient.on('connect', () => {
      this.setState({ loaded: true });
    });

    mqttClient.on('close', () => {
      this.setState({ loaded: false });
    });

    this.setState({ mqttClient, config, auth });
  }

  render() {
    if (!this.state.loaded) {
      return <Loader />;
    }

    if (this.state.error) {
      return (
        <div className="error">An error occurred <pre>{this.state.error.toString()}</pre></div>
      );
    }

    return (
      <BrowserRouter>
        <Provider value={this.state}>
          <Route exact path="/" render={() => <Home />} />
          <Route path="/config" render={() => <Config value={this.state.config} onSave={(config) => this.state.setConfig(config)} />} />
          <Route path="/logs" render={() => <Log />} />
        </Provider>
      </BrowserRouter>
    );
  }

  buildStatusParser(deviceName) {
    return (payload) => {
      const status = String(payload).toLowerCase();
      this.setState((state) => {
        return {
          status: {
            ...state.status,
            [deviceName]: status
          },
        };
      });
    };
  }

  buildOnlineStatusParser(deviceName) {
    return (payload) => {
      const online = String(payload).toLowerCase() === 'online';
      this.setState((state) => {
        return {
          onlineStatus: {
            ...state.onlineStatus,
            [deviceName]: online
          },
        };
      });
    };
  }
}
