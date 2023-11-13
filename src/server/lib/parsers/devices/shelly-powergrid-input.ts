import { Parser, TasmotaSensorPayload } from '@lib/types'
import { setDeviceStatus, setSystemStatus } from '@lib/db'
import { sendNotification } from '@lib/telegram'

const parsers: Record<string, Parser> = {
  'tele/shelly-powergrid-input/LWT': async (payload: unknown) => {
    const deviceId = 'shelly-powergrid-input'
    const newStatus = String(payload).toLowerCase()
    await setDeviceStatus(deviceId, newStatus)
    await sendNotification(
      `<b>⚡ PowerGrid Input</b> is ${
        newStatus === 'online' ? 'online 🟢' : 'offline 🔴'
      }`,
      'HTML'
    )
  },
  'tele/shelly-powergrid-input/SENSOR': async (payload: unknown) => {
    const data = payload as TasmotaSensorPayload
    const powerGridVoltage = data?.ENERGY?.Voltage ?? 0

    if (powerGridVoltage === 0) {
      return
    }

    await setSystemStatus('powerGridVoltage', powerGridVoltage)
  },
}

export default parsers
