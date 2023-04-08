import { highTemperatureHandler } from '@lib/actions'
import { callWebhook } from '@lib/ifttt'
import { Parser, TasmotaSensorPayload } from '@lib/types'

const parsers: Record<string, Parser> = {
  'tele/wemos-living-room/LWT': (payload) => {
    if (String(payload).toLowerCase() === 'offline') {
      callWebhook('device_event', 'Living Room', 'Device is offline')
    }
  },
  'tele/wemos-living-room/SENSOR': (payload) => {
    const data = payload as TasmotaSensorPayload
    const temp = data.AM2301?.Temperature ?? null

    highTemperatureHandler('Living Room', temp)
  },
}

export default parsers
