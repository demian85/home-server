import { Parser } from '@lib/types'
import { lwtParser, powerParser } from '../common'

const deviceId = 'sonoff-water-pump'

const parsers: Record<string, Parser> = {
  'tele/sonoff-water-pump/LWT': lwtParser(deviceId, '🚰 Water Pump'),
  'stat/sonoff-water-pump/POWER': powerParser(deviceId, '🚰 Water Pump'),
}

export default parsers
