import mqtt from 'mqtt'
import logger from '@lib/logger.js'
import { errorDetails } from '@lib/log-error.js'

// The reporting listener subscribes on every connection and inspects its SUBACK.
export const client = mqtt.connect(process.env.MQTT_SERVER!, {
  clean: true,
  resubscribe: false,
})

let offlineSince: number | undefined
let reportedError = false
let reconnectAttempts = 0

function markOffline() {
  if (client.disconnecting || offlineSince !== undefined) return
  offlineSince = Date.now()
  logger.warn('MQTT connection offline')
}

client.on('offline', markOffline)
client.on('close', markOffline)
client.on('reconnect', () => {
  if (++reconnectAttempts === 1) logger.info('MQTT reconnecting')
})
client.on('error', (error) => {
  if (reportedError) return
  reportedError = true
  logger.error(errorDetails(error), 'MQTT connection error')
})
client.on('connect', () => {
  if (offlineSince === undefined) {
    logger.info('MQTT connected')
  } else {
    logger.info(
      { downtimeMs: Date.now() - offlineSince, reconnectAttempts },
      'MQTT connection restored'
    )
  }
  offlineSince = undefined
  reportedError = false
  reconnectAttempts = 0
})
