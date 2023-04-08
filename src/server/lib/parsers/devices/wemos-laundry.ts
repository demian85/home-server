import { highTemperatureHandler } from '@lib/actions'
import { callWebhook } from '@lib/ifttt'
import { Parser, TasmotaSensorPayload } from '@lib/types'

const parsers: Record<string, Parser> = {
  'tele/wemos-laundry/LWT': (payload) => {
    if (String(payload).toLowerCase() === 'offline') {
      callWebhook('device_event', 'Laundry', 'Device is offline')
    }
  },
  'tele/wemos-laundry/SENSOR': (payload) => {
    const data = payload as TasmotaSensorPayload
    const temp = data.DS18B20?.Temperature ?? null

    highTemperatureHandler('Laundry', temp)
  },
}

export default parsers
