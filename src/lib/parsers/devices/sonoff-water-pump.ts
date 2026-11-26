import { Parser, TasmotaSensorPayload } from '@lib/types.js'
import { lwtParser, powerParser } from '../common.js'
import { sendNotification } from '@lib/telegram/index.js'
import { getDevicePower } from '@lib/db.js'
import { DateTime } from 'luxon'

const deviceId = 'sonoff-water-pump'

let notifications = new Set<string>()

const powerHandler = powerParser(deviceId)

const parsers: Record<string, Parser> = {
  'tele/sonoff-water-pump/LWT': lwtParser(deviceId),
  'stat/sonoff-water-pump/POWER': async (payload: unknown) => {
    await powerHandler(payload)
    notifications = new Set()
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
  const powerCycle = notifications
  if (powerCycle.has(msg)) return
  powerCycle.add(msg)
  if (!(await sendNotification(msg, 'HTML'))) {
    powerCycle.delete(msg)
  }
}

export default parsers
