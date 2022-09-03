import { client } from './client'
import { getRgbState } from './shelly'

export type Parser = (data: string) => void
interface ShellyEvent {
  event: string
  event_cnt: number
}

const parsers: Record<string, Parser> = {
  'shellies/shelly-i3-buttons/input_event/1': (payload: unknown) => {
    const data = payload as ShellyEvent
    if (data.event === 'S') {
      // toggle color
      const stateIndex = data.event_cnt % 3
      client.publish(
        'shellies/shelly-bulb-1/light/0/set',
        JSON.stringify(getRgbState(stateIndex))
      )
    }
  },
}

export default parsers
