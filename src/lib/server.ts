import { client } from './mqtt.js'
import { getMqttReportingStatus, startMqttReporting } from './mqtt-reporting.js'
import { loadParsers } from './parsers/index.js'
import { connectRedis, redisClient } from './db.js'
import { getNotificationStatus } from './telegram/index.js'
import {
  getTelegramPollingStatus,
  runTelegramPolling,
} from './telegram/polling.js'
import logger from './logger.js'
import { errorDetails } from './log-error.js'

export async function runServer(signal: AbortSignal) {
  let polling = Promise.resolve()
  const heartbeat = setInterval(() => {
    logger.info(
      {
        redisReady: redisClient.isReady,
        mqtt: { connected: client.connected, ...getMqttReportingStatus() },
        polling: getTelegramPollingStatus(),
        notifications: getNotificationStatus(),
      },
      'Reporting status'
    )
  }, 5 * 60_000).unref()

  function close() {
    clearInterval(heartbeat)
    client.end(true)
    // Let a Telegram handler finish persisting its session before closing Redis.
    void polling
      .then(async () => {
        if (redisClient.isOpen) await redisClient.disconnect()
      })
      .catch((error: unknown) => {
        logger.error({ error: errorDetails(error) }, 'Redis shutdown failed')
      })
  }
  if (signal.aborted) return close()
  signal.addEventListener('abort', close, { once: true })

  logger.info('Connecting to Redis')
  await connectRedis()
  if (signal.aborted) return
  const parsers = await loadParsers()
  if (signal.aborted) return
  startMqttReporting(parsers)

  polling = runTelegramPolling(signal).catch((error: unknown) => {
    if (!signal.aborted) {
      logger.error(
        { error: errorDetails(error) },
        'Telegram polling stopped. Check bot credentials and competing pollers, then restart the app'
      )
    }
  })
  await polling
}
