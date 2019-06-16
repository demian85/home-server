import React from 'react';
import { Link } from 'react-router-dom';

import TemperatureMeter from './TemperatureMeter';
import HumidityMeter from './HumidityMeter';
import Switcher from './Switcher';
import SmartBulbControl from './SmartBulbControl';
import AutoSwitcher from './AutoSwitcher';
import Group from './Group';
import SensorMeter from './SensorMeter';
import IlluminanceMeter from './IlluminanceMeter';
import Sun from './Sun';
import StoreProvider from '../lib/store';

import styles from './Home.css';

export default class Home extends React.Component {
  render() {
    const state = this.context;

    return (
      <section className={styles.root}>
        {state.report && (
          <section className={styles.dashboard}>
            <Group place="bedroom">
              <TemperatureMeter
                title="Temp"
                value={state.report.room.temperature}
                lastUpdate={state.report.room.lastUpdate}
              />
              <HumidityMeter title="Hum" value={state.report.room.humidity} lastUpdate={state.report.room.lastUpdate} />
              <TemperatureMeter
                title="Feel"
                value={state.report.room.realFeel}
                lastUpdate={state.report.room.lastUpdate}
              />
              <AutoSwitcher
                label={`~${state.report.config.setPoint} ˚C`}
                value={state.config.autoMode}
                onChange={(value) => state.setConfig({ autoMode: !!value })}
              />
              <Switcher
                device={state.devices.heater}
                icon="heater.svg"
                onChange={(value) => state.manualHeaterSwitch(1, value)}
              />
              <Switcher
                device={state.devices.heater2}
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
                device={state.devices.deskLamp}
                icon="desk-lamp.svg"
                onChange={(value) => state.cmnd('POWER', 'sonoff-desk-lamp', value)}
              />
              {/* <SmartBulbControl
                device={state.devices.bulb1}
                icon="roof-lamp.svg"
                onChange={(value) => state.cmnd('POWER', 'bulb1', value)}
                onSceneChange={(value) => state.cmnd('SCENE', 'bulb1', value)}
              /> */}
              <Switcher
                device={state.devices.lamp}
                icon="room-lamp.svg"
                onChange={(value) => state.cmnd('POWER', 'sonoff-lamp', value)}
              />
              {state.report.motionSensor && (
                <SensorMeter
                  title="Motion"
                  icon="/images/motion-sensor.svg"
                  value={state.report.motionSensor.on ? 'ON' : 'OFF'}
                  lastUpdate={state.report.motionSensor.lastChange}
                />
              )}
              {state.report.lounge.BMP280 && (
                <SensorMeter
                  title="Pressure"
                  icon="images/gauge.svg"
                  suffix="hPa"
                  value={state.report.lounge.BMP280.pressure}
                  lastUpdate={state.report.lounge.BMP280.lastUpdate}
                />
              )}
              {state.report.lounge.BH1750 && (
                <IlluminanceMeter
                  value={state.report.lounge.BH1750.illuminance}
                  lastUpdate={state.report.lounge.BH1750.lastUpdate}
                />
              )}
            </Group>

            <Group place="hall">
              <Switcher
                device={state.devices.socket1}
                icon="no-mosquito.svg"
                onChange={(value) => state.cmnd('POWER', 'sonoff-socket1', value)}
              />
            </Group>

            <Group place="outside">
              <TemperatureMeter
                title="Temp"
                value={state.report.patio.AM2301.temperature}
                lastUpdate={state.report.patio.AM2301.lastUpdate}
              />
              <HumidityMeter
                title="Hum"
                value={state.report.patio.AM2301.humidity}
                lastUpdate={state.report.patio.AM2301.lastUpdate}
              />
              <TemperatureMeter
                title="Feel"
                value={state.report.patio.AM2301.realFeel}
                lastUpdate={state.report.patio.AM2301.lastUpdate}
              />
              <Switcher
                device={state.devices.patio}
                icon="patio-lamp.svg"
                onChange={(value) => state.cmnd('POWER', 'sonoff-patio', value)}
              />
              <Switcher
                device={state.devices.socket2}
                icon="valve.svg"
                onChange={(value) => state.cmnd('POWER', 'sonoff-socket2', value)}
              />
              <SensorMeter icon="/images/wind.svg" value={state.report.weather.windSpeedKmh} suffix="km/h" />
              {state.report.patio.MQ135 && (
                <SensorMeter
                  title="Air Quality"
                  icon="images/air-quality.svg"
                  suffix="%"
                  value={state.report.patio.MQ135.airQuality}
                  lastUpdate={state.report.patio.MQ135.lastUpdate}
                />
              )}
              {state.report.patio.SOIL && (
                <SensorMeter
                  title="Soil Hum"
                  icon="images/soil.svg"
                  suffix="%"
                  value={state.report.patio.SOIL.value}
                  lastUpdate={state.report.patio.SOIL.lastUpdate}
                />
              )}
              <Sun data={state.report.data} />
            </Group>
          </section>
        )}
        <div className={styles.footer}>
          <Link to="/config-view">Config</Link>
          <Link to="/logs">Logs</Link>
        </div>
      </section>
    );
  }
}

Home.contextType = StoreProvider;
