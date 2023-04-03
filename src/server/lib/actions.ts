import { callWebhook } from './ifttt'

let voltageIsLow: boolean | null = null

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
