import { client } from '@lib/client'
import { ShellyEvent, getBulbPayload, getBulbState } from '@lib/shelly'
import { Parser } from '@lib/types'

const parsers: Record<string, Parser> = {
  'shellies/shelly-i3-buttons/input_event/0': (payload) => {
    const data = payload as ShellyEvent
    if (data.event === 'S') {
      // toggle state
      const turn = data.event_cnt % 2 ? 'off' : 'on'
      client.publish(
        'shellies/shelly-bulb-1/light/0/set',
        getBulbPayload({ turn })
      )
    }
  },
  'shellies/shelly-i3-buttons/input_event/1': (payload) => {
    const data = payload as ShellyEvent
    if (data.event === 'S') {
      const stateIndex = data.event_cnt % 3
      client.publish(
        'shellies/shelly-bulb-1/light/0/set',
        getBulbPayload(getBulbState(stateIndex))
      )
    }
  },
}

export default parsers
