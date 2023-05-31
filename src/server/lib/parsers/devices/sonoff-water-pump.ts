import { lwtHandler } from '@lib/actions'
import { sendNotification } from '@lib/telegram'
import { Parser } from '@lib/types'

const parsers: Record<string, Parser> = {
  'tele/sonoff-water-pump/LWT': (payload) => {
    lwtHandler('🚰 *Water Pump*', payload)
  },
  'stat/sonoff-water-pump/POWER': (payload) => {
    const data = payload as string
    sendNotification(`🚰 *Water Pump* reported: Power ${data}`)
  },
}

export default parsers
