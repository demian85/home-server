import React from 'react';

import styles from './Config.css';

export default class Config extends React.Component {

  constructor(props) {
    super(props);

    this.state = Object.assign({}, props.value || {});

    this.ranges = [
      React.createRef(),
      React.createRef(),
      React.createRef(),
      React.createRef(),
    ];
  }

  async onChange() {
    const res = await fetch('/api/config', {
      body: JSON.stringify({
        autoMode: this.state.autoMode,
        triggerTemp: this.state.triggerTemp,
        minStateDurationSecs: this.state.minStateDurationSecs,
        tempGroups: this.state.tempGroups,
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
    const groups = this.state.tempGroups.map((item, k) => {
      return (
        <div key={k}>
          <label>{item.start} - {item.end}:</label>
          <input
            className={styles.range}
            type="range"
            min="10"
            max="30"
            step="0.5"
            value={item.temp}
            ref={this.ranges[k]}
            onChange={() => this.onChange()}
          />
        </div>
      );
    });
    return (
      <section className={styles.root}>
        <div className={styles.item}>
          {groups}
        </div>
      </section>
    );
  }

}
