import { MqttClient } from 'mqtt'

export interface Device {
  id: string
  name: string
  type: 'rgb' | 'switch' | 'input'
  subscriptions: string[]
  url?: string
  sendCommand: (
    mqttClient: MqttClient,
    cmd: string,
    value: string
  ) => Promise<void>
  setTemperature?: (mqttClient: MqttClient, temp: number) => Promise<void>
}

export interface Config {
  subscriptions: string[]
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