import { Parser } from '@lib/types'
import { lwtParser, temperatureSensorParser } from '../common'

const deviceId = 'mobile-heater-1'
const deviceName = '🛏 Mobile Heater'

const parsers: Record<string, Parser> = {
  'tele/mobile-heater-1/LWT': lwtParser(deviceId, deviceName),
  'tele/mobile-heater-1/SENSOR': temperatureSensorParser(deviceId),
}

export default parsers
