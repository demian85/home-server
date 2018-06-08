import React from 'react';

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
                <a href="/config">Config</a>
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
                    onChange={(value) => state.cmnd('sonoff-heater', value ? '1' : '0')}
                    onAutoChange={(value) => state.setConfig('autoMode', value)}
                  />
                  <TemperatureMeter title="Temperatura" value={state.report.temperature} />
                  <TemperatureMeter title="Sensación térmica" value={state.report.realFeel} />
                  <HumidityMeter title="Humedad" value={state.report.humidity} />
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
