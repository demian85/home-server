import React from 'react';
import { Link } from 'react-router-dom';

import TemperatureMeter from './TemperatureMeter';
import HumidityMeter from './HumidityMeter';
import Switcher from './Switcher';
import AutoSwitcher from './AutoSwitcher';
import { Consumer } from '../lib/store';

import styles from './Home.css';

export default function Home() {
  return (
    <Consumer>
      {
        (state) => (
            <section className={styles.root}>
              <div className={styles.header}>
                <h1>Home Dashboard</h1>
                <Link to="/config">Config</Link>
              </div>
              {
                state.report &&
                <section className={styles.dashboard}>
                  <Switcher
                    title="Lámpara de sal"
                    value={state.status.lamp}
                    onChange={(value) => state.cmnd('sonoff-lamp', value)} />
                  <Switcher
                    title="Patio"
                    value={state.status.patio}
                    onChange={(value) => state.cmnd('sonoff-patio', value)} />
                  <AutoSwitcher
                    title="Estufa"
                    switchValue={state.status.heater}
                    autoValue={state.config.autoMode}
                    onChange={(value) => state.manualHeaterSwitch(value)}
                    onAutoChange={(value) => state.setConfig('autoMode', value)}
                  />
                  <TemperatureMeter title="Temp" value={state.report.room.temperature} />
                  <TemperatureMeter title="Real Feel" value={state.report.room.realFeel} />
                  <HumidityMeter title="Hum" value={state.report.room.humidity} />

                  <TemperatureMeter title="Living Temp." value={state.report.lounge.temperature} />
                  <TemperatureMeter title="Living Real Feel" value={state.report.lounge.realFeel} />
                  <HumidityMeter title="Living Hum." value={state.report.lounge.humidity} />
                </section>
              }
              <pre>
                { JSON.stringify(state.report, null, '  ') }
              </pre>
              <pre>
                { JSON.stringify(state.config, null, '  ') }
              </pre>
            </section>
          )
      }
    </Consumer>

  );
}
