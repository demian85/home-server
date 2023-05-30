import { highTemperatureHandler } from '@lib/actions'
import { sendNotification } from '@lib/telegram'
import { Parser, TasmotaSensorPayload } from '@lib/types'

const parsers: Record<string, Parser> = {
  'tele/wemos-laundry/LWT': (payload) => {
    const online = String(payload).toLowerCase() === 'online'
    sendNotification(`*Laundry* is ${online ? 'online 🟢' : 'offline 🔴'}`)
  },
  'tele/wemos-laundry/SENSOR': (payload) => {
    const data = payload as TasmotaSensorPayload
    const temp = data.DS18B20?.Temperature ?? null
    highTemperatureHandler('Laundry', temp)
  },
}

export default parsers
