import { Parser } from '@lib/types'
import { lwtParser, voltageParser } from '../common'

const parsers: Record<string, Parser> = {
  'tele/shelly-door-light/LWT': lwtParser(
    'shelly-door-light',
    '💡 Main Door Light'
  ),
  'tele/shelly-door-light/SENSOR': voltageParser(),
}

export default parsers
