import { client } from './client'
import { callWebhook } from './ifttt'
import { getBulbPayload, getBulbState, ShellyEvent } from './shelly'
import { Parser, TasmotaSensorPayload } from './types'

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
  'tele/sonoff-pool-pump/LWT': (payload) => {
    if (String(payload).toLowerCase() === 'offline') {
      callWebhook('device_event', 'Pool Pump', 'Device is offline')
    }
  },
  'tele/sonoff-pool-pump/SENSOR': (payload) => {
    const data = payload as TasmotaSensorPayload
    const voltage = data?.ENERGY?.Voltage ?? null
    if (voltage === null) {
      return
    }
    if (voltage <= 205) {
      callWebhook(
        'device_event',
        'Energy watcher',
        `Voltage is LOW: ${voltage}`
      )
    } else if (voltage >= 212) {
      callWebhook(
        'device_event',
        'Energy watcher',
        `Voltage is NORMAL: ${voltage}`
      )
    }
  },
  'tele/sonoff-water-pump/LWT': (payload) => {
    if (String(payload).toLowerCase() === 'offline') {
      callWebhook('device_event', 'Water Pump', 'Device is offline')
    }
  },
}

export default parsers
