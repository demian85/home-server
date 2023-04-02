import { callWebhook } from '@lib/ifttt'
import { Parser } from '@lib/types'

const parsers: Record<string, Parser> = {
  'tele/sonoff-water-pump/LWT': (payload) => {
    if (String(payload).toLowerCase() === 'offline') {
      callWebhook('device_event', 'Water Pump', 'Device is offline')
    }
  },
}

export default parsers
