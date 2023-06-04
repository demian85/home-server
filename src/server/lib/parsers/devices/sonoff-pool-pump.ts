import { Parser } from '@lib/types'
import { lwtParser, voltageParser } from '../common'

const deviceId = 'sonoff-pool-pump'

const parsers: Record<string, Parser> = {
  'tele/sonoff-pool-pump/LWT': lwtParser(deviceId, '🌊 *Pool Pump*'),
  'tele/sonoff-pool-pump/SENSOR': voltageParser(),
}

export default parsers
