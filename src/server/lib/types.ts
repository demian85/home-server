export interface Device {
  name: string
  type: 'rgb' | 'switch' | 'input'
  subscriptions: string[]
  powerOn: () => void
  powerOff: () => void
}

export interface Config {
  devices: Device[]
}

export type Parser = (data: unknown) => void
