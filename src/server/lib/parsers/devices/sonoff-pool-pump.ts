import { voltageHandler } from '@lib/actions'
import { callWebhook } from '@lib/ifttt'
import { Parser, TasmotaSensorPayload } from '@lib/types'

const parsers: Record<string, Parser> = {
  'tele/sonoff-pool-pump/LWT': (payload) => {
    if (String(payload).toLowerCase() === 'offline') {
      callWebhook('device_event', 'Pool Pump', 'Device is offline')
    }
  },
  'tele/sonoff-pool-pump/SENSOR': (payload) => {
    const data = payload as TasmotaSensorPayload
    const voltage = data?.ENERGY?.Voltage ?? 0

    voltageHandler(voltage)
  },
}

export default parsers
