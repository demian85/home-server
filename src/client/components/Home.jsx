import React from 'react';
// import { Link } from 'react-router-dom';

import TemperatureMeter from './TemperatureMeter';
import HumidityMeter from './HumidityMeter';
import Switcher from './Switcher';
import AutoSwitcher from './AutoSwitcher';
import Wind from './Wind';
import Group from './Group';
import { Consumer } from '../lib/store';

import styles from './Home.css';

export default function Home() {
  return (
    <Consumer>
      {
        (state) => (
          <section className={styles.root}>
            {
              state.report && state.status &&
              <section className={styles.dashboard}>

                <Group place="bedroom">
                  <Switcher
                    value={state.status.lamp}
                    icon="room-lamp.svg"
                    onChange={(value) => state.cmnd('sonoff-lamp', value)} />
                  <AutoSwitcher
                    switchValue={state.status.heater}
                    autoValue={state.config.autoMode}
                    icon="heater.svg"
                    onChange={(value) => state.manualHeaterSwitch(value)}
                    onAutoChange={(value) => state.setConfig('autoMode', value)}
                  />
                  <TemperatureMeter title="Temp" value={state.report.room.temperature} />
                  <TemperatureMeter title="Real Feel" value={state.report.room.realFeel} />
                  <HumidityMeter title="Hum" value={state.report.room.humidity} />
                </Group>

                <Group place="lounge">
                  <Switcher
                    value={state.status['desk-lamp']}
                    icon="desk-lamp.svg"
                    onChange={(value) => state.cmnd('sonoff-desk-lamp', value)} />
                  <TemperatureMeter title="Temp" value={state.report.lounge.temperature} />
                  <TemperatureMeter title="Real Feel" value={state.report.lounge.realFeel} />
                  <HumidityMeter title="Hum" value={state.report.lounge.humidity} />
                </Group>

                <Group place="outside">
                  <Switcher
                    value={state.status.patio}
                    icon="patio-lamp.svg"
                    onChange={(value) => state.cmnd('sonoff-patio', value)} />
                  <TemperatureMeter title="Temp" value={state.report.weather.temperature} />
                  <TemperatureMeter title="Real Feel" value={state.report.weather.realFeel} />
                  <HumidityMeter title="Hum" value={state.report.weather.humidity} />
                  <Wind value={state.report.weather.windSpeedKmh} />
                </Group>

              </section>
            }
            {/* <div className={styles.footer}>
                <Link to="/config">Config</Link>
              </div> */}
          </section>
        )
      }
    </Consumer>

  );
}
