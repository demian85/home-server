import { highHumidityHandler, highTemperatureHandler } from '@lib/actions'
import { Parser, TasmotaSensorPayload } from '@lib/types'
import { lwtParser } from '../common'

const deviceId = 'wemos-living-room'

const parsers: Record<string, Parser> = {
  'tele/wemos-living-room/LWT': lwtParser(deviceId, '🛋 Living Room'),
  'tele/wemos-living-room/SENSOR': async (payload) => {
    const data = payload as TasmotaSensorPayload
    const temp = data.AM2301?.Temperature ?? null
    const humidity = data.AM2301?.Humidity ?? null
    highTemperatureHandler('🛋 Living Room', temp)
    highHumidityHandler('🛋 Living Room', humidity)
  },
}

export default parsers
