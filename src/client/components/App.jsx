import React from 'react';
import { Route } from 'react-router-dom';
import { initMqttClient } from '../lib/mqtt';

import Home from './Home';
import Config from './Config';

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      mqttClient: null,
      config: null,
      report: null,
      auth: null,
      status: {
        'sonoff-lamp': 'on',
        'sonoff-patio': 'off',
        'sonoff-heater': 'off',
      },
    };
  }

  async componentDidMount() {
    const res = await fetch('/init', { credentials: 'include' });
    const { report, config, auth } = await res.json();
    localStorage.apiKey = auth.apiKey;
    localStorage.mqttUrl = auth.mqttUrl;
    const mqttClient = initMqttClient();

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
        {
          !this.state.loaded && <div>Loading...</div>
        }
        <Route exact path="/" render={() => <Home report={this.state.report} status={this.state.status} />} />
        <Route path="/config" render={() => <Config value={this.state.config} />} />
      </section>
    );
  }

}
