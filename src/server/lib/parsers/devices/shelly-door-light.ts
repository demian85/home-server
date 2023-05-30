import { sendNotification } from '@lib/telegram'
import { Parser } from '@lib/types'

const parsers: Record<string, Parser> = {
  'tele/shelly-door-light/LWT': (payload) => {
    const online = String(payload).toLowerCase() === 'online'
    sendNotification(
      `💡 *Main Door Light* is ${online ? 'online 🟢' : 'offline 🔴'}`
    )
  },
}

export default parsers
