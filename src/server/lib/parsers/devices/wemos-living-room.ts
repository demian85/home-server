import {
  highHumidityHandler,
  highTemperatureHandler,
  lwtHandler,
} from '@lib/actions'
import { Parser, TasmotaSensorPayload } from '@lib/types'

const parsers: Record<string, Parser> = {
  'tele/wemos-living-room/LWT': (payload) => {
    lwtHandler('🛋 *Living Room*', payload)
  },
  'tele/wemos-living-room/SENSOR': (payload) => {
    const data = payload as TasmotaSensorPayload
    const temp = data.AM2301?.Temperature ?? null
    const humidity = data.AM2301?.Humidity ?? null
    highTemperatureHandler('🛋 *Living Room*', temp)
    highHumidityHandler('🛋 *Living Room*', humidity)
  },
}

export default parsers
