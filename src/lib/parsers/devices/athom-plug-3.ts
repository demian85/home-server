import { Parser } from '@lib/types.js'
import { automationEventParser, lwtParser, powerParser } from '../common.js'

const deviceId = 'athom-plug-3'

const parsers: Record<string, Parser> = {
  [`tele/${deviceId}/LWT`]: lwtParser(deviceId),
  [`stat/${deviceId}/POWER`]: powerParser(deviceId),
  [`stat/${deviceId}/AUTO`]: automationEventParser(deviceId),
}

export default parsers
