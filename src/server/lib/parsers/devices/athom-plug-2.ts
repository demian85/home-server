import { Parser } from '@lib/types'
import { lwtParser, voltageParser } from '../common.js'

const deviceId = 'athom-plug-2'

const parsers: Record<string, Parser> = {
  [`tele/${deviceId}/LWT`]: lwtParser(deviceId),
  [`tele/${deviceId}/SENSOR`]: voltageParser(),
}

export default parsers
