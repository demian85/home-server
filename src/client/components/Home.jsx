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
              {
                state.report && state.status &&
                <section className={styles.dashboard}>
                  <Switcher
                    title="Escritorio"
                    value={state.status['desk-lamp']}
                    icon="illumination.svg"
                    onChange={(value) => state.cmnd('sonoff-desk-lamp', value)} />
                  <Switcher
                    title="Patio"
                    value={state.status.patio}
                    icon="illumination.svg"
                    onChange={(value) => state.cmnd('sonoff-patio', value)} />
                  <Switcher
                    title="Velador"
                    value={state.status.lamp}
                    icon="illumination.svg"
                    onChange={(value) => state.cmnd('sonoff-lamp', value)} />
                  <AutoSwitcher
                    title="Estufa"
                    switchValue={state.status.heater}
                    autoValue={state.config.autoMode}
                    icon="heater.svg"
                    onChange={(value) => state.manualHeaterSwitch(value)}
                    onAutoChange={(value) => state.setConfig('autoMode', value)}
                  />
                  <TemperatureMeter title="Temp" value={state.report.room.temperature} place="bedroom" />
                  <TemperatureMeter title="Real Feel" value={state.report.room.realFeel} place="bedroom" />
                  <HumidityMeter title="Hum" value={state.report.room.humidity} place="bedroom" />

                  <TemperatureMeter title="Temp" value={state.report.lounge.temperature} place="lounge" />
                  <TemperatureMeter title="Real Feel" value={state.report.lounge.realFeel} place="lounge" />
                  <HumidityMeter title="Hum" value={state.report.lounge.humidity} place="lounge" />

                  <TemperatureMeter title="Outside" value={state.report.weather.temperature} place="outside" />
                  <HumidityMeter title="Outside" value={state.report.weather.humidity} place="outside"/>
                </section>
              }
              <div className={styles.footer}>
                <Link to="/config">Config</Link>
              </div>
            </section>
          )
      }
    </Consumer>

  );
}
