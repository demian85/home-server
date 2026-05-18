import { Config, RoomWithTargetTemp } from '@lib/types.js'
import { DateTime } from 'luxon'

const config: Config = {
  subscriptions: ['tele/+/SENSOR', 'tele/+/LWT', 'stat/+/POWER'],
  rooms: [
    {
      id: 'living',
      name: 'Living Room',
      temperatures: [
        { temp: 10, weekDays: [1, 7], hours: [0, 6] },
        { temp: 18, weekDays: [1, 7], hours: [6, 10] },
        { temp: 16, weekDays: [1, 7], hours: [10, 17] },
        { temp: 18, weekDays: [1, 7], hours: [17, 0] },
      ],
    },
    {
      id: 'benja',
      name: "Benja's room",
      temperatures: [
        { temp: 16, weekDays: [6, 7], hours: [9, 17] },
        { temp: 21, weekDays: [6, 7], hours: [17, 9] },
        { temp: 16, weekDays: [1, 5], hours: [7, 17] },
        { temp: 21, weekDays: [1, 5], hours: [17, 7] },
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
      types: ['switch', 'sensor'],
      subtype: 'heater',
      subscriptions: [],
      url: 'http://192.168.68.63/',
    },
    {
      id: 'laundry-sensors',
      name: `🌡️ Laundry`,
      room: 'laundry',
      types: ['sensor'],
      subscriptions: [],
      url: 'http://192.168.68.56/',
    },
    {
      id: 'iotero-sht40-sensor-1',
      name: `🌡️ Sensor 1 - Office`,
      room: 'office',
      types: ['sensor'],
      subscriptions: [],
      url: 'http://192.168.68.73/',
    },
    {
      id: 'iotero-sht40-sensor-2',
      name: `🌡️ Sensor 2 - Habitación Benja`,
      room: 'benja',
      types: ['sensor'],
      subscriptions: [],
      url: 'http://192.168.68.74/',
    },
    {
      id: 'athom-plug-1',
      name: `🔌 Plug 1 - Washing machine`,
      room: 'laundry',
      types: ['switch'],
      subscriptions: [],
      url: 'http://192.168.68.72/',
    },
    {
      id: 'athom-plug-2',
      name: `🔌 Plug 2 - Estufa Benja`,
      room: 'benja',
      types: ['switch'],
      subtype: 'heater',
      subscriptions: [],
      url: 'http://192.168.68.76/',
    },
    {
      id: 'sonoff-water-pump',
      name: '🚰 Water Pump',
      room: 'garage',
      types: ['switch'],
      subscriptions: [],
      url: 'http://192.168.68.60/',
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
  return config.devices.find(
    (d) =>
      d.room === roomId && d.types.includes('switch') && d.subtype === 'heater'
  )
}

export function getSensorDevice(roomId?: string) {
  return config.devices.find(
    (d) => d.room === roomId && d.types.includes('sensor')
  )
}

export function getRoomsWithTargetTemp(): RoomWithTargetTemp[] {
  const today = DateTime.local()
  const hour = today.hour
  const weekDay = today.weekday
  const rooms: RoomWithTargetTemp[] = []

  config.rooms.reduce((prev, curr) => {
    const targetTemp = curr.temperatures?.find((item) => {
      const [startHour, endHour] = item.hours
      const [startDay, endDay] = item.weekDays

      const matchesHour =
        startHour < endHour
          ? hour >= startHour && hour < endHour
          : hour >= startHour || hour < endHour

      const matchesDay =
        startDay < endDay
          ? weekDay >= startDay && weekDay <= endDay
          : weekDay >= startDay || weekDay <= endDay

      return matchesHour && matchesDay
    })
    prev.push({ id: curr.id, temp: targetTemp ? targetTemp.temp : null })
    return prev
  }, rooms)

  return rooms
}

export default config
