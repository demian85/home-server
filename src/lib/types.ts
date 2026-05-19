import { MqttClient } from 'mqtt'

export interface Device {
  id: string
  room: string
  name: string
  types: ('rgb' | 'switch' | 'sensor')[]
  subtype?: 'heater' | 'light'
  subscriptions: string[]
  url?: string
  setTemperature?: (mqttClient: MqttClient, temp: number) => Promise<void>
}

export type Room = {
  id: string
  name: string
  temperatures?: TemperatureRange[]
}

export type RoomWithTargetTemp = { id: string; temp: number | null }

// hours are inclusive -> exclusive, 24h format
// week days: 1-7, https://en.wikipedia.org/wiki/ISO_week_date
export type TemperatureRange = {
  temp: number
  weekDays: [number, number]
  hours: [number, number]
}

export interface Config {
  subscriptions: string[]
  rooms: Room[]
  devices: Device[]
}

export type Parser = (data: unknown) => Promise<void>

export interface TasmotaSensorPayload {
  Time: string
  TempUnit?: string
  ANALOG?: {
    A0: number
  }
  ENERGY?: TasmotaEnergyValues
  DS18B20?: TasmotaTempSensorValues
  AM2301?: TasmotaTempSensorValues
  SI7021?: TasmotaTempSensorValues
  SHT4X?: TasmotaTempSensorValues
}

interface TasmotaEnergyValues {
  TotalStartTime: string
  Total: number
  Yesterday: number
  Today: number
  Period: number
  Power: number
  ApparentPower: number
  ReactivePower: number
  Factor: number
  Voltage: number
  Current: number
}

interface TasmotaTempSensorValues {
  Id: string
  Temperature: number
  Humidity?: number
  DewPoint?: number
}

export interface TasmotaStatePayload {
  Time: string
  Uptime: string
  UptimeSec: number
  Heap: number
  SleepMode: string
  Sleep: number
  LoadAvg: number
  MqttCount: number
  POWER: 'ON' | 'OFF'
  Wifi?: {
    AP: number
    SSId: string
    BSSId: string
    Channel: number
    RSSI: number
    Signal: number
    LinkCount: number
    Downtime: string
  }
}

export type PowerStatus = 'on' | 'off'
