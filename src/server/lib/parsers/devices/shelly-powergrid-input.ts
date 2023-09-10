import { Parser, TasmotaSensorPayload } from '@lib/types'
import { lwtParser } from '../common'
import { setSystemStatus } from '@lib/db'

const parsers: Record<string, Parser> = {
  'tele/shelly-powergrid-input/LWT': lwtParser(
    'shelly-powergrid-input',
    '⚡ PowerGrid Input'
  ),
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
