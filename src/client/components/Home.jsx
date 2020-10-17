import React from 'react';
import { Link } from 'react-router-dom';

import TemperatureMeter from './TemperatureMeter';
import HumidityMeter from './HumidityMeter';
import Switcher from './Switcher';
// import SmartBulbControl from './SmartBulbControl';
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
            <Group place="bedroom" room="bigRoom">
              {state.report.room && (
                <>
                  <TemperatureMeter
                    title="Temp"
                    value={state.report.room.AM2301.temperature}
                    lastUpdate={state.report.room.AM2301.lastUpdate}
                  />
                  <HumidityMeter
                    title="Hum"
                    value={state.report.room.AM2301.humidity}
                    lastUpdate={state.report.room.AM2301.lastUpdate}
                  />
                </>
              )}
              <AutoSwitcher
                label={`~${state.report.heating.setPoints.bigRoom} ˚C`}
                value={state.config.rooms.bigRoom.autoMode}
                onChange={(value) =>
                  state.setRoomConfig('bigRoom', { autoMode: !!value })
                }
              />
              {state.report.room.MQ135 && (
                <SensorMeter
                  title="Air Quality"
                  icon="images/air-quality.svg"
                  suffix="%"
                  value={state.report.room.MQ135.airQuality}
                  normalRange={[70, 100]}
                  lastUpdate={state.report.room.MQ135.lastUpdate}
                />
              )}
              <Switcher
                device={state.devices.bedRoomSocket}
                icon="no-mosquito.svg"
                onChange={(value) =>
                  state.sendCommand(
                    state.devices.bedRoomSocket.topics.power,
                    value ? 'on' : 'off'
                  )
                }
              />
            </Group>

            <Group place="smallRoom" room="smallRoom">
              {state.report.smallRoom && (
                <>
                  <TemperatureMeter
                    title="Temp"
                    value={state.report.smallRoom.SI7021.temperature}
                    lastUpdate={state.report.smallRoom.SI7021.lastUpdate}
                  />
                  <HumidityMeter
                    title="Hum"
                    value={state.report.smallRoom.SI7021.humidity}
                    lastUpdate={state.report.smallRoom.SI7021.lastUpdate}
                  />
                </>
              )}
              <AutoSwitcher
                label={`~${state.report.heating.setPoints.smallRoom} ˚C`}
                value={state.config.rooms.smallRoom.autoMode}
                onChange={(value) =>
                  state.setRoomConfig('smallRoom', { autoMode: !!value })
                }
              />
              <Switcher
                device={state.devices.heaterPanel}
                icon="heater.svg"
                onChange={(value) => {
                  state.sendCommand(
                    state.devices.heaterPanel.topics.power,
                    value
                  );
                  state.setRoomConfig('smallRoom', { autoMode: false });
                }}
              />
              <Switcher
                device={state.devices.smallRoomSocket}
                icon="no-mosquito.svg"
                onChange={(value) =>
                  state.sendCommand(
                    state.devices.smallRoomSocket.topics.power,
                    value ? 'on' : 'off'
                  )
                }
              />
            </Group>

            <Group place="bathroom" room="bathRoom">
              <AutoSwitcher
                label={`~${state.report.heating.setPoints.bathRoom} ˚C`}
                value={state.config.rooms.bathRoom.autoMode}
                onChange={(value) =>
                  state.setRoomConfig('bathRoom', { autoMode: !!value })
                }
              />
              <Switcher
                device={state.devices.bathroom}
                // icon="towel-rail.svg"
                icon="heater.svg"
                onChange={(value) => {
                  state.sendCommand(state.devices.bathroom.topics.power, value);
                  state.setRoomConfig('bathRoom', { autoMode: false });
                }}
              />
            </Group>

            <Group place="lounge" room="livingRoom">
              {state.report.lounge && (
                <>
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
                </>
              )}
              <AutoSwitcher
                label={`~${state.report.heating.setPoints.livingRoom} ˚C`}
                value={state.config.rooms.livingRoom.autoMode}
                onChange={(value) =>
                  state.setRoomConfig('livingRoom', { autoMode: !!value })
                }
              />
              <Switcher
                device={state.devices.mobileHeater}
                icon="heater.svg"
                onChange={(value) => {
                  state.sendCommand(
                    state.devices.mobileHeater.topics.power,
                    value
                  );
                  state.setRoomConfig('livingRoom', { autoMode: false });
                }}
              />
              <Switcher
                device={state.devices.flameLamp}
                icon="lantern.svg"
                onChange={(value) =>
                  state.sendCommand(state.devices.flameLamp.topics.power, value)
                }
              />
              <Switcher
                device={state.devices.saltLamp}
                icon="room-lamp.svg"
                onChange={(value) =>
                  state.sendCommand(state.devices.saltLamp.topics.power, value)
                }
              />
              <Switcher
                device={state.devices.heaterLight}
                icon="chimney.svg"
                onChange={(value) =>
                  state.sendCommand(
                    state.devices.heaterLight.topics.power,
                    value
                  )
                }
              />
              {state.report.motionSensor?.sensors?.map((sensor, index) => {
                return (
                  <SensorMeter
                    key={index}
                    title={`Motion ${index + 1}`}
                    icon="/images/motion-sensor.svg"
                    value={sensor.on ? 'ON' : 'OFF'}
                    lastUpdate={sensor.lastChange}
                  />
                );
              })}
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
              {state.report.lounge.IAQ && (
                <>
                  <SensorMeter
                    title="eCO2"
                    icon="images/co2.svg"
                    suffix="ppm"
                    value={state.report.lounge.IAQ.eCO2}
                    normalRange={[300, 1500]}
                    lastUpdate={state.report.lounge.IAQ.lastUpdate}
                  />
                  <SensorMeter
                    title="TVOC"
                    icon="images/air-quality.svg"
                    suffix="ppb"
                    value={state.report.lounge.IAQ.TVOC}
                    normalRange={[100, 800]}
                    lastUpdate={state.report.lounge.IAQ.lastUpdate}
                  />
                </>
              )}
            </Group>

            <Group place="kitchen">
              <Switcher
                device={state.devices.mosquitoTrap1}
                icon="no-mosquito.svg"
                onChange={(value) =>
                  state.sendCommand(
                    state.devices.mosquitoTrap1.topics.power,
                    value ? 'on' : 'off'
                  )
                }
              />
            </Group>

            <Group place="laundry">
              <Switcher
                device={state.devices.laundryLamp}
                icon="desk-lamp.svg"
                onChange={(value) =>
                  state.sendCommand(
                    state.devices.laundryLamp.topics.power,
                    value ? 'on' : 'off'
                  )
                }
              />
              {state.report.laundry && (
                <>
                  <TemperatureMeter
                    title="Temp"
                    value={state.report.laundry?.DS18B20?.temperature}
                    lastUpdate={state.report.laundry?.DS18B20?.lastUpdate}
                  />
                </>
              )}
            </Group>

            <Group place="garage">
              <Switcher
                device={state.devices.garageLamp}
                icon="illumination.svg"
                onChange={(value) =>
                  state.sendCommand(
                    state.devices.garageLamp.topics.power,
                    value ? 'on' : 'off'
                  )
                }
              />
              <Switcher
                device={state.devices.garageMosquitoTrap}
                icon="no-mosquito.svg"
                onChange={(value) =>
                  state.sendCommand(
                    state.devices.garageMosquitoTrap.topics.power,
                    value ? 'on' : 'off'
                  )
                }
              />
              <Switcher
                device={state.devices.wellWaterPump}
                icon="water-pump.svg"
                onChange={(value) =>
                  state.sendCommand(
                    state.devices.wellWaterPump.topics.power,
                    value ? 'on' : 'off'
                  )
                }
              />
            </Group>

            <Group place="garden">
              <Switcher
                device={state.devices.poolPump}
                icon="valve.svg"
                onChange={(value) =>
                  state.sendCommand(state.devices.poolPump.topics.power, value)
                }
              />
              <Switcher
                device={state.devices.gardenMosquitoTrap}
                icon="no-mosquito.svg"
                onChange={(value) =>
                  state.sendCommand(
                    state.devices.gardenMosquitoTrap.topics.power,
                    value ? 'on' : 'off'
                  )
                }
              />
              <TemperatureMeter
                title="Temp"
                value={state.report.garden.AM2301?.temperature}
                lastUpdate={state.report.garden.AM2301?.lastUpdate}
              />
              <HumidityMeter
                title="Hum"
                value={state.report.garden.AM2301?.humidity}
                lastUpdate={state.report.garden.AM2301?.lastUpdate}
              />
              <IlluminanceMeter
                value={state.report.garden.APDS9960?.illuminance}
                lastUpdate={state.report.garden.APDS9960?.lastUpdate}
              />
              {/* <SensorMeter
                    icon="/images/solar-panel.svg"
                    value={state.report.garden.solarPanelVolts?.value.toFixed(
                      2
                    )}
                    normalRange={[4.4, 6]}
                    lastUpdate={state.report.garden.solarPanelVolts?.lastUpdate}
                    suffix="V"
                  />
                  <SensorMeter
                    icon="/images/battery.svg"
                    value={state.report.garden.batteryVolts?.value.toFixed(2)}
                    normalRange={[3.6, 4.2]}
                    lastUpdate={state.report.garden.batteryVolts?.lastUpdate}
                    suffix="V"
                  /> */}
              {/* {state.report.room.SOIL && (
                <SensorMeter
                  title="Soil Hum"
                  icon="images/soil.svg"
                  suffix="%"
                  value={state.report.room.SOIL.value}
                  lastUpdate={state.report.room.SOIL.lastUpdate}
                />
              )} */}
            </Group>

            <Group place="outside">
              {state.report.weather && (
                <>
                  <TemperatureMeter
                    title="Temp"
                    value={state.report.weather.temperature}
                    lastUpdate={state.report.weather.lastUpdate}
                  />
                  <SensorMeter
                    icon="/images/wind.svg"
                    value={state.report.weather.windSpeedKmh}
                    suffix="km/h"
                  />
                </>
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
