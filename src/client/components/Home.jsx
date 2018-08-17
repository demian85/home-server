import React from 'react';
import { Link } from 'react-router-dom';

import TemperatureMeter from './TemperatureMeter';
import HumidityMeter from './HumidityMeter';
import Switcher from './Switcher';
import Wind from './Wind';
import Group from './Group';
import MotionSensor from './MotionSensor';
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
                  <TemperatureMeter title="Temp" value={state.report.room.temperature} />
                  <HumidityMeter title="Hum" value={state.report.room.humidity} />
                  <TemperatureMeter title="Feel" value={state.report.room.realFeel} />
                  <Switcher
                    title={`~${state.report.config.triggerTemp} ˚C`}
                    value={state.config.autoMode}
                    icon="auto-mode.svg"
                    onChange={(value) => state.setConfig({ autoMode: !!value })} />
                  <Switcher
                    value={state.status.lamp}
                    icon="room-lamp.svg"
                    onChange={(value) => state.cmnd('sonoff-lamp', value)} />
                  <Switcher
                    value={state.status.heater}
                    icon="heater.svg"
                    onChange={(value) => state.manualHeaterSwitch(1, value)} />
                  <Switcher
                    value={state.status.heater2}
                    icon="heater2.svg"
                    onChange={(value) => state.manualHeaterSwitch(2, value)} />
                </Group>

                <Group place="lounge">
                  <TemperatureMeter title="Temp" value={state.report.lounge.temperature} />
                  <HumidityMeter title="Hum" value={state.report.lounge.humidity} />
                  <TemperatureMeter title="Feel" value={state.report.lounge.realFeel} />
                  <Switcher
                    value={state.status['desk-lamp']}
                    icon="desk-lamp.svg"
                    onChange={(value) => state.cmnd('sonoff-desk-lamp', value)} />
                  <MotionSensor value={state.status.wemos} />
                </Group>

                <Group place="outside">
                  <TemperatureMeter title="Temp" value={state.report.weather.temperature} />
                  <HumidityMeter title="Hum" value={state.report.weather.humidity} />
                  <TemperatureMeter title="Feel" value={state.report.weather.realFeel} />
                  <Switcher
                    value={state.status.patio}
                    icon="patio-lamp.svg"
                    onChange={(value) => state.cmnd('sonoff-patio', value)} />
                  <Wind value={state.report.weather.windSpeedKmh} />
                </Group>

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
