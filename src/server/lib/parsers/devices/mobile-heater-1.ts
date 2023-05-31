import {
  highHumidityHandler,
  highTemperatureHandler,
  lwtHandler,
} from '@lib/actions'
import { Parser, TasmotaSensorPayload } from '@lib/types'

const parsers: Record<string, Parser> = {
  'tele/mobile-heater-1/LWT': (payload) => {
    lwtHandler('🛏 *Mobile Heater*', payload)
  },
  'tele/mobile-heater-1/SENSOR': (payload) => {
    const data = payload as TasmotaSensorPayload
    const temp = data.SI7021?.Temperature ?? null
    const humidity = data.SI7021?.Humidity ?? null
    highTemperatureHandler('🛏 *Mobile Heater*', temp)
    highHumidityHandler('🛏 *Mobile Heater*', humidity)
  },
}

export default parsers
