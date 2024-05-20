import {
  automaticTemperatureHandler,
  highTemperatureHandler,
} from '@lib/actions'
import { Parser, TasmotaSensorPayload } from '@lib/types'
import { lwtParser } from '../common'
import { setDeviceKey } from '@lib/db'

const deviceId = 'wemos-garage'

const parsers: Record<string, Parser> = {
  'tele/wemos-garage/LWT': lwtParser(deviceId, '🚗 Garage'),
  'tele/wemos-garage/SENSOR': async (payload) => {
    const data = payload as TasmotaSensorPayload
    const temp = data.AM2301?.Temperature ?? null
    const humidity = data.AM2301?.Humidity ?? null

    await setDeviceKey(deviceId, 'temperature', temp ? String(temp) : null)
    await setDeviceKey(deviceId, 'humidity', humidity ? String(humidity) : null)

    await automaticTemperatureHandler()

    highTemperatureHandler('🚗 Garage', temp)
  },
}

export default parsers
