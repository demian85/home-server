import { highHumidityHandler, highTemperatureHandler } from '@lib/actions'
import { Parser, TasmotaSensorPayload } from '@lib/types'
import { lwtParser } from '../common'

const deviceId = 'mobile-heater-1'

const parsers: Record<string, Parser> = {
  'tele/mobile-heater-1/LWT': lwtParser(deviceId, '🛏 Mobile Heater'),
  'tele/mobile-heater-1/SENSOR': async (payload) => {
    const data = payload as TasmotaSensorPayload
    const temp = data.SI7021?.Temperature ?? null
    const humidity = data.SI7021?.Humidity ?? null
    highTemperatureHandler('🛏 Mobile Heater', temp)
    highHumidityHandler('🛏 Mobile Heater', humidity)
  },
}

export default parsers
