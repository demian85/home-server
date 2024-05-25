import { Parser } from '@lib/types'
import { lwtParser, temperatureSensorParser } from '../common'

const deviceId = 'wemos-office'
const deviceName = '💻 Office'

const parsers: Record<string, Parser> = {
  'tele/wemos-office/LWT': lwtParser(deviceId, deviceName),
  'tele/wemos-office/SENSOR': temperatureSensorParser(deviceId),
}

export default parsers
