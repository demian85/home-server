import { Parser } from '@lib/types'
import { lwtParser, temperatureSensorParser } from '../common'

const deviceId = 'wemos-laundry'
const deviceName = '🧺 Laundry'

const parsers: Record<string, Parser> = {
  'tele/wemos-laundry/LWT': lwtParser(deviceId, deviceName),
  'tele/wemos-laundry/SENSOR': temperatureSensorParser(deviceId),
}

export default parsers
