import { callWebhook } from './ifttt'

let voltageIsLow: boolean | null = null
let tempIsHigh = false

export function voltageHandler(voltage: number) {
  if (voltage === 0) {
    return
  }

  if (voltage <= 205 && (voltageIsLow === false || voltageIsLow === null)) {
    callWebhook('device_event', 'Energy watcher', `Voltage is LOW: ${voltage}v`)
    voltageIsLow = true
  } else if (
    voltage >= 212 &&
    (voltageIsLow === true || voltageIsLow === null)
  ) {
    callWebhook(
      'device_event',
      'Energy watcher',
      `Voltage is NORMAL: ${voltage}v`
    )
    voltageIsLow = false
  }
}

export function highTemperatureHandler(source: string, temp: number | null) {
  if (temp === null) {
    return
  }

  if (temp > 30 && !tempIsHigh) {
    callWebhook('device_event', source, `Temperature is HIGH: ${temp} C`)
    tempIsHigh = true
  } else {
    tempIsHigh = false
  }
}
