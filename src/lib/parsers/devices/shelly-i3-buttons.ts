import { client } from '@lib/mqtt.js'
import { ShellyEvent, getBulbPayload, getBulbState } from '@lib/shelly.js'
import { Parser } from '@lib/types.js'

const parsers: Record<string, Parser> = {
  'shellies/shelly-i3-buttons/input_event/0': async (payload) => {
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
  'shellies/shelly-i3-buttons/input_event/1': async (payload) => {
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
