import 'dotenv/config'
import dns from 'node:dns'
import logger from '@lib/logger.js'
import { errorDetails } from '@lib/log-error.js'

dns.setDefaultResultOrder('ipv4first')

const shutdown = new AbortController()
function stop(signal: NodeJS.Signals) {
  if (shutdown.signal.aborted) return
  logger.info({ signal }, 'Server stopping')
  shutdown.abort()
  setTimeout(() => {
    logger.error('Server shutdown timed out')
    process.exit(1)
  }, 8000).unref()
}
process.once('SIGINT', stop)
process.once('SIGTERM', stop)

try {
  const required = ['REDIS_URL', 'MQTT_SERVER']
  const missing = required.filter((key) => !process.env[key])
  if (missing.length) {
    logger.fatal({ missing }, 'Required environment variables missing')
    process.exit(1)
  }
  const missingTelegram = [
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_NOTIFICATIONS_TARGET',
  ].filter((key) => !process.env[key])
  if (missingTelegram.length) {
    logger.error(
      { missing: missingTelegram },
      'Telegram configuration incomplete'
    )
  }
  // Load clients and validate config inside the startup error boundary.
  const { runServer } = await import('@lib/server.js')
  await runServer(shutdown.signal)
} catch (error) {
  if (!shutdown.signal.aborted) {
    logger.fatal({ error: errorDetails(error) }, 'Server initialization failed')
    process.exit(1)
  }
}
