import { highTemperatureHandler } from '@lib/actions'
import { Parser, TasmotaSensorPayload } from '@lib/types'
import { lwtParser } from '../common'

const deviceId = 'wemos-laundry'

const parsers: Record<string, Parser> = {
  'tele/wemos-laundry/LWT': lwtParser(deviceId, '🧺 *Laundry*'),
  'tele/wemos-laundry/SENSOR': async (payload) => {
    const data = payload as TasmotaSensorPayload
    const temp = data.DS18B20?.Temperature ?? null
    highTemperatureHandler('🧺 *Laundry*', temp)
  },
}

export default parsers
