import React from 'react';
import { cloneDeep } from 'lodash';

import StoreProvider from '../lib/store';

import styles from './Config.css';

export default class Config extends React.Component {
  static contextType = StoreProvider;

  constructor(props) {
    super(props);

    this.state = cloneDeep(props.value);
  }

  render() {
    return (
      <section className={styles.root}>
        <div className={styles.content}>
          <label>Heaters on/off state minimum persistence in minutes: </label>
          <input
            type="number"
            min="2"
            max="30"
            step="1"
            value={this.state.minStateDurationSecs / 60}
            onChange={(e) =>
              this.setState({ minStateDurationSecs: e.target.value * 60 })
            }
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
          <input
            type="time"
            value={this.state.bedTime}
            onChange={(e) => this.setState({ bedTime: e.target.value })}
          />
        </div>
        <div className={styles.content}>
          <label>
            <input
              type="checkbox"
              checked={!!this.state.autoTurnOnDeskLamp}
              style={{ marginRight: '5px' }}
              onChange={(e) =>
                this.setState({ autoTurnOnDeskLamp: e.target.checked })
              }
            />
            Turn ON lounge lamp automatically when motion is detected (after
            night time)
          </label>
        </div>
        <div className={styles.content}>
          <label>
            <input
              type="checkbox"
              checked={!!this.state.autoTurnOffDeskLamp}
              style={{ marginRight: '5px' }}
              onChange={(e) =>
                this.setState({ autoTurnOffDeskLamp: e.target.checked })
              }
            />
            Turn OFF lounge lamp automatically
            <input
              type="number"
              value={this.state.autoTurnOffDeskLampDelay}
              style={{ margin: '0 5px' }}
              min="0"
              max="3600"
              step="1"
              onChange={(e) =>
                this.setState({ autoTurnOffDeskLampDelay: e.target.value })
              }
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
