import { Parser } from '@lib/types'
import { lwtParser, temperatureSensorParser } from '../common'

const deviceId = 'wemos-garage'
const deviceName = '🚗 Garage'

const parsers: Record<string, Parser> = {
  'tele/wemos-garage/LWT': lwtParser(deviceId, deviceName),
  'tele/wemos-garage/SENSOR': temperatureSensorParser(deviceId),
}

export default parsers
