import { lwtHandler, voltageHandler } from '@lib/actions'
import { Parser, TasmotaSensorPayload } from '@lib/types'

const parsers: Record<string, Parser> = {
  'tele/sonoff-pool-pump/LWT': (payload) => {
    lwtHandler('🌊 *Pool Pump*', payload)
  },
  'tele/sonoff-pool-pump/SENSOR': (payload) => {
    const data = payload as TasmotaSensorPayload
    const voltage = data?.ENERGY?.Voltage ?? 0
    voltageHandler(voltage)
  },
}

export default parsers
