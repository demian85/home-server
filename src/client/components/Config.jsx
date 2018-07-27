import React from 'react';
import * as _ from 'lodash';

import styles from './Config.css';

const presets = {
  'simple': [
    { start: 0, end: 24, temp: 23 },
  ],
  'default': [
    { start: 0, end: 9, temp: 23.4 },
    { start: 9, end: 18, temp: 22 },
    { start: 18, end: 24, temp: 23.4 },
  ],
  'sleep': [
    { start: 0, end: 10, temp: 23.4 },
    { start: 10, end: 20, temp: 22 },
    { start: 20, end: 24, temp: 23.4 },
  ]
};

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
          <div>{item.start} - {item.end} hs.</div>
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
        <div className={styles.content}>
          <p>Set desired real feel temperature for each time frame:</p>
          <div className={styles.presets}>
            <label>Presets: </label>
            <button className={styles.presetBtn} onClick={() => this.onPresetClick('default')}>Default</button>
            <button className={styles.presetBtn} onClick={() => this.onPresetClick('simple')}>Simple</button>
            <button className={styles.presetBtn} onClick={() => this.onPresetClick('sleep')}>Sleep</button>
          </div>
          <div className={styles.tempGroups}>
            {tempGroups}
          </div>
        </div>
        <div className={styles.content}>
          <label>Heaters on/off state minimum persistence in minutes: </label>
          <input
            type="number"
            min="2"
            max="30"
            step="1"
            value={this.state.minStateDurationSecs / 60}
            onChange={(e) => this.setState({ minStateDurationSecs: e.target.value * 60 })}
          />
        </div>
        <div className={styles.controls}>
          <button className={styles.saveBtn} onClick={() => this.save()}>Save</button>
          <button className={styles.cancelBtn} onClick={() => history.back()}>Back</button>
        </div>
      </section>
    );
  }

  async save() {
    await this.props.onSave(this.state);
    history.back();
  }

  onPresetClick(name) {
    this.setState({
      tempGroups: _.cloneDeep(presets[name])
    });
  }

  handleTempChange(key, value) {
    this.setState((prevState) => {
      const tempGroups = prevState.tempGroups;
      prevState.tempGroups[key].temp = Number(value);
      return { tempGroups };
    });
  }
}
