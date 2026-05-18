import { Parser } from '@lib/types'
import { lwtParser, temperatureSensorParser } from '../common.js'

const deviceId = 'laundry-sensors'

const parsers: Record<string, Parser> = {
  [`tele/${deviceId}/LWT`]: lwtParser(deviceId),
  [`tele/${deviceId}/SENSOR`]: temperatureSensorParser(deviceId),
}

export default parsers
