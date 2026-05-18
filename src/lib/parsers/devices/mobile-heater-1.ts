import { Parser } from '@lib/types.js'
import { lwtParser, powerParser, temperatureSensorParser } from '../common.js'

const deviceId = 'mobile-heater-1'

const parsers: Record<string, Parser> = {
  [`tele/${deviceId}/LWT`]: lwtParser(deviceId),
  [`tele/${deviceId}/SENSOR`]: temperatureSensorParser(deviceId),
  [`stat/${deviceId}/POWER`]: powerParser(deviceId),
}

export default parsers
