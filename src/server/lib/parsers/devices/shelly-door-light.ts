import { Parser } from '@lib/types'
import { lwtParser } from '../common'

const parsers: Record<string, Parser> = {
  'tele/shelly-door-light/LWT': lwtParser(
    'shelly-door-light',
    '💡 *Main Door Light*'
  ),
}

export default parsers
