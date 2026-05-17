import { getDeviceKey } from '@lib/db'
import { Config, Room, RoomWithTargetTemp } from '@lib/types'
import { DateTime } from 'luxon'

const config: Config = {
  subscriptions: ['tele/+/SENSOR', 'tele/+/LWT', 'stat/+/POWER'],
  rooms: [
    {
      id: 'living',
      name: 'Living Room',
      temperatures: [
        { temp: 10, weekDays: [1, 7], hours: [0, 6] },
        { temp: 18, weekDays: [1, 7], hours: [6, 0] },
      ],
    },
    {
      id: 'benja',
      name: "Benja's room",
      temperatures: [
        { temp: 16, weekDays: [6, 7], hours: [9, 17] },
        { temp: 20, weekDays: [6, 7], hours: [17, 9] },
        { temp: 16, weekDays: [1, 5], hours: [7, 17] },
        { temp: 20, weekDays: [1, 5], hours: [17, 7] },
      ],
    },
    { id: 'office', name: 'Office' },
    { id: 'garden', name: 'Garden' },
    { id: 'laundry', name: 'Laundry' },
    { id: 'garage', name: 'Garage' },
  ],
  devices: [
    {
      id: 'mobile-heater-1',
      name: '♨️​ Mobile Heater',
      room: 'living',
      type: 'switch',
      subscriptions: [],
      url: 'http://192.168.68.63/',
      async sendCommand(mqttClient, cmd, value) {
        mqttClient.publish(`cmnd/mobile-heater-1/${cmd.toUpperCase()}`, value)
      },
      async setTemperature(mqttClient, temp) {
        const targetTemp = Math.max(1, temp)
        await this.sendCommand(
          mqttClient,
          'Rule1',
          ` on SI7021#Temperature<${targetTemp} do Power 1 endon
            on SI7021#Temperature>${targetTemp + 0.5} do Power 0 endon`
        )
      },
    },
    {
      id: 'laundry-sensors',
      name: `🌡️​ Laundry`,
      room: 'laundry',
      type: 'sensor',
      subscriptions: [],
      url: 'http://192.168.68.56/',
      async sendCommand(mqttClient, cmd, value) {
        mqttClient.publish(`cmnd/laundry-sensors/${cmd.toUpperCase()}`, value)
      },
    },
    {
      id: 'iotero-sht40-sensor-1',
      name: `🌡️​ Sensor 1 (Office)`,
      room: 'office',
      type: 'sensor',
      subscriptions: [],
      url: 'http://192.168.68.73/',
      async sendCommand(mqttClient, cmd, value) {
        mqttClient.publish(
          `cmnd/iotero-sht40-sensor-1/${cmd.toUpperCase()}`,
          value
        )
      },
    },
    {
      id: 'iotero-sht40-sensor-2',
      name: `🌡️​ Sensor 2 (Benja)`,
      room: 'benja',
      type: 'sensor',
      subscriptions: [],
      url: 'http://192.168.68.74/',
      async sendCommand(mqttClient, cmd, value) {
        mqttClient.publish(
          `cmnd/iotero-sht40-sensor-2/${cmd.toUpperCase()}`,
          value
        )
      },
    },
    {
      id: 'athom-plug-1',
      name: `🔌​ Plug 1 (Washing machine)`,
      room: 'laundry',
      type: 'switch',
      subscriptions: [],
      url: 'http://192.168.68.72/',
      async sendCommand(mqttClient, cmd, value) {
        mqttClient.publish(`cmnd/athom-plug-1/${cmd.toUpperCase()}`, value)
      },
    },
    {
      id: 'athom-plug-2',
      name: `🔌​ Plug 2 (Estufa Benja)`,
      room: 'benja',
      type: 'switch',
      subscriptions: [],
      url: 'http://192.168.68.76/',
      async sendCommand(mqttClient, cmd, value) {
        mqttClient.publish(`cmnd/athom-plug-2/${cmd.toUpperCase()}`, value)
      },
    },
    // {
    //   id: 'athom-plug-3',
    //   name: `🔌​ Plug 3 (Pool Pump)`,
    //   room: 'garden',
    //   type: 'switch',
    //   subscriptions: [],
    //   url: 'http://192.168.68.76/',
    //   async sendCommand(mqttClient, cmd, value) {
    //     mqttClient.publish(`cmnd/athom-plug-3/${cmd.toUpperCase()}`, value)
    //   },
    // },
    {
      id: 'sonoff-water-pump',
      name: '🚰 Water Pump',
      room: 'garage',
      type: 'switch',
      subscriptions: [],
      url: 'http://192.168.68.60/',
      async sendCommand(mqttClient, cmd, value) {
        mqttClient.publish(`cmnd/sonoff-water-pump/${cmd.toUpperCase()}`, value)
      },
    },
  ],
}

export function getDevice(id?: string) {
  return config.devices.find((d) => d.id === id)
}

export function getRoom(id?: string) {
  return config.rooms.find((d) => d.id === id)
}

export function getHeatingDevice(roomId?: string) {
  return config.devices.find((d) => d.room === roomId && d.type === 'switch')
}

export function getSensorDevice(roomId?: string) {
  return config.devices.find((d) => d.room === roomId && d.type === 'sensor')
}

export function getRoomsWithTargetTemp(): RoomWithTargetTemp[] {
  const today = DateTime.local()
  const hour = today.hour
  const weekDay = today.weekday
  const rooms: RoomWithTargetTemp[] = []

  config.rooms.reduce((prev, curr) => {
    const targetTemp = curr.temperatures?.find((item) => {
      return (
        hour >= item.hours[0] &&
        hour < item.hours[1] &&
        weekDay >= item.weekDays[0] &&
        weekDay < item.weekDays[1]
      )
    })
    prev.push({ id: curr.id, temp: targetTemp ? targetTemp.temp : null })
    return prev
  }, rooms)

  return rooms
}

export default config
