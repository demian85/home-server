import React from 'react';
import { Route } from 'react-router-dom';
import { apiCall } from '../lib/util';

import Home from './Home';
import Config from './Config';

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      config: null,
      report: null
    };
  }

  async componentDidMount() {
    const report = await apiCall('/report');
    const config = await apiCall('/config');
    this.setState({ loaded: true, report, config });
  }

  render() {
    return (
      <section>
        {
          !this.state.loaded && <div>Loading...</div>
        }
        <Route exact path="/" render={() => <Home report={this.state.report} />} />
        <Route path="/config" render={() => <Config value={this.state.config} />} />
      </section>
    );
  }

}
