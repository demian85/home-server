import { voltageHandler } from '@lib/actions'
import { sendNotification } from '@lib/telegram'
import { Parser, TasmotaSensorPayload } from '@lib/types'

const parsers: Record<string, Parser> = {
  'tele/sonoff-pool-pump/LWT': (payload) => {
    const online = String(payload).toLowerCase() === 'online'
    sendNotification(`*Pool Pump* is ${online ? 'online 🟢' : 'offline 🔴'}`)
  },
  'tele/sonoff-pool-pump/SENSOR': (payload) => {
    const data = payload as TasmotaSensorPayload
    const voltage = data?.ENERGY?.Voltage ?? 0
    voltageHandler(voltage)
  },
}

export default parsers
