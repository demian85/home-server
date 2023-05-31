import { lwtHandler } from '@lib/actions'
import { Parser } from '@lib/types'

const parsers: Record<string, Parser> = {
  'tele/shelly-door-light/LWT': (payload) => {
    lwtHandler('💡 *Main Door Light*', payload)
  },
}

export default parsers
