import { Parser, TasmotaSensorPayload } from '@lib/types'
import { lwtParser, powerParser } from '../common'
import { sendNotification } from '@lib/telegram'
import { getDevicePower } from '@lib/db'
import { DateTime } from 'luxon'

const deviceId = 'sonoff-water-pump'

const notifications: string[] = []

const powerHandler = powerParser(deviceId, '🚰 Water Pump')

const parsers: Record<string, Parser> = {
  'tele/sonoff-water-pump/LWT': lwtParser(deviceId, '🚰 Water Pump'),
  'stat/sonoff-water-pump/POWER': async (payload: unknown) => {
    await powerHandler(payload)
    notifications.splice(0, notifications.length)
  },
  'tele/sonoff-water-pump/SENSOR': async (payload: unknown) => {
    const data = payload as TasmotaSensorPayload
    const power = data?.ENERGY?.Power ?? 0
    const powerStatus = await getDevicePower(deviceId)

    if (!powerStatus || power < 100 || powerStatus.value === 'off') {
      return
    }

    const onSince = DateTime.fromMillis(powerStatus.timestamp)

    if (Math.abs(onSince.diffNow().as('seconds')) < 5) {
      return
    }

    if (power < 300) {
      await sendNotificationOnce(`🚰 Water Pump reported: No water flow!`)
      return
    }

    if (power < 450) {
      await sendNotificationOnce(`🚰 Water Pump reported: Poor water flow!`)
      return
    }
  },
}

async function sendNotificationOnce(msg: string) {
  if (!notifications.includes(msg)) {
    await sendNotification(msg, 'HTML')
    notifications.push(msg)
  }
}

export default parsers
