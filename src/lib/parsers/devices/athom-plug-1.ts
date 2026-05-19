import { Parser } from '@lib/types.js'
import { lwtParser, powerParser, voltageParser } from '../common.js'

const deviceId = 'athom-plug-1'

const parsers: Record<string, Parser> = {
  [`tele/${deviceId}/LWT`]: lwtParser(deviceId),
  [`tele/${deviceId}/SENSOR`]: voltageParser(),
  [`stat/${deviceId}/POWER`]: powerParser(deviceId),
}

export default parsers
