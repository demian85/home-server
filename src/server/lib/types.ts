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
  ENERGY?: {
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
}
