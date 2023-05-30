import { sendNotification } from '@lib/telegram'
import { Parser } from '@lib/types'

const parsers: Record<string, Parser> = {
  'tele/sonoff-water-pump/LWT': (payload) => {
    const online = String(payload).toLowerCase() === 'online'
    sendNotification(`*Water Pump* is ${online ? 'online' : 'offline'}`)
  },
}

export default parsers
