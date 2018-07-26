import React from 'react';
import * as _ from 'lodash';

import styles from './Config.css';

export default class Config extends React.Component {

  constructor(props) {
    super(props);
    this.state = _.cloneDeep(props.value);
  }

  render() {
    if (!this.state.tempGroups) {
      return null;
    }

    const tempGroups = this.state.tempGroups.map((item, key) => {
      return (
        <div className={styles.tempGroup} key={key}>
          <span>{item.start} - {item.end} hs.</span>
          <input
            type="number"
            min="10"
            max="30"
            step="0.1"
            value={item.temp}
            onChange={(e) => this.handleTempChange(key, e.target.value)}
          />
        </div>
      );
    });

    return (
      <section className={styles.root}>
        <p>Set desired real feel temperature for each time frame:</p>
        <div className={styles.content}>
          {tempGroups}
        </div>
        <div className={styles.controls}>
          <button className={styles.saveBtn} onClick={() => this.save()}>Save</button>
          <button className={styles.cancelBtn} onClick={() => history.back()}>Back</button>
        </div>
      </section>
    );
  }

  async save() {
    await fetch('/api/config', {
      body: JSON.stringify({
        autoMode: this.state.autoMode,
        defaultTriggerTemp: this.state.defaultTriggerTemp,
        minStateDurationSecs: this.state.minStateDurationSecs,
        tempGroups: this.state.tempGroups
      }),
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    history.back();
  }

  handleTempChange(key, value) {
    this.setState((prevState) => {
      const tempGroups = prevState.tempGroups;
      prevState.tempGroups[key].temp = Number(value);
      return { tempGroups };
    });
  }
}
