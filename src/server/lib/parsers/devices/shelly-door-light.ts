import { callWebhook } from '@lib/ifttt'
import { Parser } from '@lib/types'

const parsers: Record<string, Parser> = {
  'tele/shelly-door-light/LWT': (payload) => {
    if (String(payload).toLowerCase() === 'offline') {
      callWebhook('device_event', 'Main Door Light', 'Device is offline')
    }
  },
}

export default parsers
