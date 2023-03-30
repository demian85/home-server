import { callWebhook } from '@lib/ifttt'
import { Parser, TasmotaSensorPayload } from '@lib/types'

let voltageIsLow: boolean | null = null

export const sensorParser: Parser = (payload) => {
  const data = payload as TasmotaSensorPayload
  const voltage = data?.ENERGY?.Voltage ?? 0

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

export const lwtParser: Parser = (payload) => {
  if (String(payload).toLowerCase() === 'offline') {
    callWebhook('device_event', 'Pool Pump', 'Device is offline')
  }
}
