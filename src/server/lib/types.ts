export interface Device {
  name: string
  type: 'rgb' | 'switch' | 'input'
  subscriptions: string[]
  powerOn: () => void
  powerOff: () => void
}

export interface Config {
  subscriptions: string[]
  devices: Device[]
}

export type Parser = (data: unknown) => void

export interface TasmotaSensorPayload {
  Time: string
  TempUnit?: string
  ENERGY?: TasmotaEnergyValues
  DS18B20?: TasmotaTempSensorValues
  AM2301?: TasmotaTempSensorValues
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
