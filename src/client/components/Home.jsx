import React from 'react';
import { Link } from 'react-router-dom';

import TemperatureMeter from './TemperatureMeter';
import HumidityMeter from './HumidityMeter';
import Switcher from './Switcher';
import Group from './Group';
import SensorMeter from './SensorMeter';
import IlluminanceMeter from './IlluminanceMeter';
import Sun from './Sun';
import StoreProvider from '../lib/store';

import styles from './Home.css';

export default class Home extends React.Component {
  render() {
    const state = this.context;
    const motionSensorValue = state.powerStatus.wemos1 ? String(state.powerStatus.wemos1).toUpperCase() : '-';

    return (
      <section className={styles.root} >
        {
          state.report && state.powerStatus &&
          <section className={styles.dashboard}>

            <Group place="bedroom">
              <TemperatureMeter
                title="Temp"
                value={state.report.room.temperature}
                lastUpdate={state.report.room.lastUpdate}
              />
              <HumidityMeter
                title="Hum"
                value={state.report.room.humidity}
                lastUpdate={state.report.room.lastUpdate}
              />
              <TemperatureMeter
                title="Feel"
                value={state.report.room.realFeel}
                lastUpdate={state.report.room.lastUpdate}
              />
              <Switcher
                title={`~${state.report.config.setPoint} ˚C`}
                value={state.config.autoMode}
                icon="auto-mode.svg"
                onChange={(value) => state.setConfig({ autoMode: !!value })}
              />
              <Switcher
                value={state.powerStatus.lamp}
                online={state.onlineStatus.lamp}
                icon="room-lamp.svg"
                onChange={(value) => state.cmnd('sonoff-lamp', value)}
              />
              <Switcher
                value={state.powerStatus.heater}
                online={state.onlineStatus.heater}
                icon="heater.svg"
                onChange={(value) => state.manualHeaterSwitch(1, value)}
              />
              <Switcher
                value={state.powerStatus.heater2}
                online={state.onlineStatus.heater2}
                icon="heater2.svg"
                onChange={(value) => state.manualHeaterSwitch(2, value)}
              />
            </Group>

            <Group place="lounge">
              <TemperatureMeter
                title="Temp"
                value={state.report.lounge.AM2301.temperature}
                lastUpdate={state.report.lounge.AM2301.lastUpdate}
              />
              <HumidityMeter
                title="Hum"
                value={state.report.lounge.AM2301.humidity}
                lastUpdate={state.report.lounge.AM2301.lastUpdate}
              />
              <TemperatureMeter
                title="Feel"
                value={state.report.lounge.AM2301.realFeel}
                lastUpdate={state.report.lounge.AM2301.lastUpdate}
              />
              <Switcher
                value={state.powerStatus['desk-lamp']}
                online={state.onlineStatus['desk-lamp']}
                icon="desk-lamp.svg"
                onChange={(value) => state.cmnd('sonoff-desk-lamp', value)}
              />
              <SensorMeter
                title="Motion"
                icon="/images/motion-sensor.svg"
                value={motionSensorValue}
                lastUpdate={state.report.motionSensor && state.report.motionSensor.lastChange}
              />
              {
                state.report.lounge.BMP280 &&
                <SensorMeter
                  title="Pressure"
                  icon="images/gauge.svg"
                  value={state.report.lounge.BMP280.pressure}
                  suffix="hPa"
                  lastUpdate={state.report.lounge.BMP280.lastUpdate}
                />
              }
              {
                state.report.lounge.BH1750 &&
                <IlluminanceMeter
                  value={state.report.lounge.BH1750.illuminance}
                  lastUpdate={state.report.lounge.BH1750.lastUpdate}
                />
              }
            </Group>

            <Group place="hall">
              <Switcher
                value={state.powerStatus.socket1}
                online={state.onlineStatus.socket1}
                icon="no-mosquito.svg"
                onChange={(value) => state.cmnd('sonoff-socket1', value)}
              />
            </Group>

            <Group place="outside">
              <TemperatureMeter
                title="Temp"
                value={state.report.weather.temperature}
                lastUpdate={state.report.weather.lastUpdate}
              />
              <HumidityMeter
                title="Hum"
                value={state.report.weather.humidity}
                lastUpdate={state.report.weather.lastUpdate}
              />
              <TemperatureMeter
                title="Feel"
                value={state.report.weather.realFeel}
                lastUpdate={state.report.weather.lastUpdate}
              />
              <Switcher
                value={state.powerStatus.patio}
                online={state.onlineStatus.patio}
                icon="patio-lamp.svg"
                onChange={(value) => state.cmnd('sonoff-patio', value)} />
              <SensorMeter
                icon="/images/wind.svg"
                value={state.report.weather.windSpeedKmh}
                suffix="km/h"
              />
              <Sun data={state.report.data} />
            </Group>

          </section>
        }
        <div className={styles.footer} >
          <Link to="/config">Config</Link> | <Link to="/logs">Logs</Link>
        </div>
      </section >
    );
  }
}

Home.contextType = StoreProvider;
