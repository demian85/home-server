import { highTemperatureHandler, lwtHandler } from '@lib/actions'
import { Parser, TasmotaSensorPayload } from '@lib/types'

const parsers: Record<string, Parser> = {
  'tele/wemos-laundry/LWT': (payload) => {
    lwtHandler('🧺 *Laundry*', payload)
  },
  'tele/wemos-laundry/SENSOR': (payload) => {
    const data = payload as TasmotaSensorPayload
    const temp = data.DS18B20?.Temperature ?? null
    highTemperatureHandler('🧺 *Laundry*', temp)
  },
}

export default parsers
