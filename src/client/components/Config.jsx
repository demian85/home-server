import React from 'react';
import * as _ from 'lodash';

import styles from './Config.css';

export default class Config extends React.Component {

  constructor(props) {
    super(props);

    this.state = _.cloneDeep(props.value);
    this.presets = {
      'simple': [
        { start: 0, end: 24, temp: 21 },
      ],
      'default': [
        { start: 0, end: 9, temp: 21 },
        { start: 9, end: 18, temp: 19 },
        { start: 18, end: 24, temp: 20.5 },
      ],
      'sleep': [
        { start: 0, end: 4, temp: 21 },
        { start: 4, end: 9, temp: 21.2 },
        { start: 9, end: 21, temp: 19 },
        { start: 21, end: 24, temp: 20.5 },
      ]
    };
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
          <p>Set desired set point for each time frame:</p>
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
          <label>Trigger: </label>
          <select value={this.state.trigger} onChange={(e) => this.setState({ trigger: e.target.value })}>
            <option value="temp">Temperature</option>
            <option value="feel">Real feel</option>
          </select>
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
      tempGroups: _.cloneDeep(this.presets[name])
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
