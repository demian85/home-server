import { Parser } from '@lib/types'
import { lwtParser, temperatureSensorParser } from '../common'

const deviceId = 'wemos-living-room'
const deviceName = '🛋 Living Room'

const parsers: Record<string, Parser> = {
  'tele/wemos-living-room/LWT': lwtParser(deviceId, deviceName),
  'tele/wemos-living-room/SENSOR': temperatureSensorParser(deviceId),
}

export default parsers
