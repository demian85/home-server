import React from 'react';

import styles from './Config.css';

export default class Config extends React.Component {

  constructor(props) {
    super(props);

    this.state = props.value || {};
  }

  async onChange() {
    const res = await fetch('/api/config', {
      body: JSON.stringify({
        autoMode: this.state.autoMode,
        triggerTemp: this.state.triggerTemp,
        minStateDurationSecs: this.state.minStateDurationSecs,
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.jwt || ''
      }
    });
    console.log(res);
  }

  render() {
    return (
      <section className={styles.root}>
        <div className={styles.item}>
          <label>
            <input type="checkbox" ref={(src) => this.autoMode = src} value="1" onChange={() => this.onChange()} />
            <span> Auto mode</span>
          </label>
        </div>
        <div className={styles.item}>
          <label>
            <span>Trigger temp: </span>
            <input
              type="number"
              min="10"
              max="30"
              step="0.1"
              ref={(src) => this.triggerTemp = src}
              value={this.state.triggerTemp}
              onChange={() => this.setState({ triggerTemp: this.value })}
            />
          </label>
        </div>
      </section>
    );
  }

}
