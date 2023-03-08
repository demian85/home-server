import { client } from './client'
import { callWebhook } from './ifttt'
import { getBulbPayload, getBulbState, ShellyEvent } from './shelly'
import { Parser } from './types'

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
  'tele/sonoff-pool-pump/LWT': async (payload) => {
    if (String(payload).toLowerCase() === 'offline') {
      await callWebhook('device_event', 'Pool Pump', 'Device is offline')
    }
  },
  'tele/sonoff-water-pump/LWT': async (payload) => {
    if (String(payload).toLowerCase() === 'offline') {
      await callWebhook('device_event', 'Water Pump', 'Device is offline')
    }
  },
}

export default parsers
