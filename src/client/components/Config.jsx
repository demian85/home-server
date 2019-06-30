import React from 'react';
import { cloneDeep } from 'lodash';

import StoreProvider from '../lib/store';

import styles from './Config.css';

export default class Config extends React.Component {
  static contextType = StoreProvider;

  constructor(props) {
    super(props);

    this.state = cloneDeep(props.value);
    this.presets = {
      simple: [{ start: 0, end: 24, temp: 20.5 }],
      default: [{ start: 0, end: 9, temp: 21 }, { start: 9, end: 18, temp: 19 }, { start: 18, end: 24, temp: 20.7 }],
      sleep: [
        { start: 0, end: 4, temp: 20.7 },
        { start: 4, end: 9, temp: 20.9 },
        { start: 9, end: 18, temp: 18 },
        { start: 18, end: 24, temp: 20.7 },
      ],
    };
  }

  render() {
    if (!this.state.tempGroups) {
      return null;
    }

    const tempGroups = this.state.tempGroups.map((item, key) => {
      return (
        <div className={styles.tempGroup} key={key}>
          <div>
            {item.start} - {item.end} hs.
          </div>
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
            <button className={styles.presetBtn} onClick={() => this.onPresetClick('default')}>
              Default
            </button>
            <button className={styles.presetBtn} onClick={() => this.onPresetClick('simple')}>
              Simple
            </button>
            <button className={styles.presetBtn} onClick={() => this.onPresetClick('sleep')}>
              Sleep
            </button>
          </div>
          <div className={styles.tempGroups}>{tempGroups}</div>
        </div>
        <div className={styles.content}>
          <label>Threshold: </label>
          <input
            type="number"
            min="0.1"
            max="2"
            step="0.1"
            value={this.state.threshold}
            onChange={(e) => this.setState({ threshold: e.target.value })}
          />
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
        <div className={styles.content}>
          <label>Night time: </label>
          <input
            type="time"
            value={this.state.nightTime || ''}
            disabled={this.state.nightTime === null}
            onChange={(e) => this.setNightTime(e.target.value)}
          />
          &nbsp;
          <label>
            <input
              type="checkbox"
              checked={this.state.nightTime === null}
              onChange={(e) => this.setNightTime(e.target.checked)}
            />
            &nbsp;Use sunset
          </label>
        </div>
        <div className={styles.content}>
          <label>Bed time: </label>
          <input type="time" value={this.state.bedTime} onChange={(e) => this.setState({ bedTime: e.target.value })} />
        </div>
        <div className={styles.content}>
          <label>
            <input
              type="checkbox"
              checked={!!this.state.autoTurnOnDeskLamp}
              style={{ marginRight: '5px' }}
              onChange={(e) => this.setState({ autoTurnOnDeskLamp: e.target.checked })}
            />
            Turn ON desk lamp automatically when motion is detected (after night time)
          </label>
        </div>
        <div className={styles.content}>
          <label>
            <input
              type="checkbox"
              checked={!!this.state.autoTurnOffDeskLamp}
              style={{ marginRight: '5px' }}
              onChange={(e) => this.setState({ autoTurnOffDeskLamp: e.target.checked })}
            />
            Turn OFF desk lamp automatically
            <input
              type="number"
              value={this.state.autoTurnOffDeskLampDelay}
              style={{ margin: '0 5px' }}
              min="0"
              max="3600"
              step="1"
              onChange={(e) => this.setState({ autoTurnOffDeskLampDelay: e.target.value })}
            />
            seconds after motion sensor went off (after bed time)
          </label>
        </div>
        <div className={styles.controls}>
          <button className={styles.saveBtn} onClick={() => this.save()}>
            Save
          </button>
          <button className={styles.cancelBtn} onClick={() => history.back()}>
            Back
          </button>
        </div>
      </section>
    );
  }

  setNightTime(value) {
    this.setState({ nightTime: value === true ? null : value });
  }

  async save() {
    await this.props.onSave(this.state);
    history.back();
  }

  onPresetClick(name) {
    this.setState({
      tempGroups: cloneDeep(this.presets[name]),
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
