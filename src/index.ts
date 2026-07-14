import 'dotenv/config'
import dns from 'node:dns'

import { client } from '@lib/mqtt.js'
import logger from '@lib/logger.js'
import { loadParsers } from '@lib/parsers/index.js'
import config from './config.js'
import telegramBot, { sendNotification } from '@lib/telegram/index.js'
import { connectRedis } from '@lib/db.js'

// Prefer IPv4 to avoid ETIMEDOUT when IPv6 is present but unrouted (common in Docker).
dns.setDefaultResultOrder('ipv4first')

const TELEGRAM_MAX_RETRIES = 5
const TELEGRAM_BASE_DELAY_MS = 2000

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

async function startTelegramBot(): Promise<boolean> {
  for (let attempt = 1; attempt <= TELEGRAM_MAX_RETRIES; attempt++) {
    try {
      await telegramBot.launch(() => {
        logger.info('Telegram bot is up and running')
      })
      return true
    } catch (error: any) {
      if (error?.response?.error_code === 409) {
        logger.error(
          { error: error.message },
          'Another bot instance is already running (409 Conflict). Kill all node processes and try again.'
        )
        throw new Error(
          'Telegram bot 409 Conflict: Another instance is already running. Run: pkill -f "ai-telegram-assistant-bot.*tsx" && sleep 2',
          { cause: error }
        )
      }

      const errorCode = error?.code ?? error?.errno
      const isNetworkError =
        errorCode === 'ETIMEDOUT' ||
        errorCode === 'ECONNREFUSED' ||
        errorCode === 'ENETUNREACH' ||
        errorCode === 'EAI_AGAIN'

      if (!isNetworkError || attempt === TELEGRAM_MAX_RETRIES) {
        logger.error({ error, attempt }, 'Telegram bot failed to start')
        return false
      }

      const delay = TELEGRAM_BASE_DELAY_MS * 2 ** (attempt - 1)
      logger.warn(
        { error: error.message, attempt, delay },
        'Telegram bot launch failed, retrying...'
      )
      await sleep(delay)
    }
  }

  return false
}

/////------------------------------------
;(async function init() {
  logger.info('Connecting to Redis...')
  await connectRedis()
  logger.info('Redis connected')

  const parsers = await loadParsers()

  function onMqttConnect() {
    logger.info('MQTT Client connected')

    const topics = config.subscriptions.concat(
      config.devices.reduce((prev, curr) => {
        prev = prev.concat(curr.subscriptions)
        return prev
      }, [] as string[])
    )

    client.subscribe(topics, (err, _granted) => {
      if (err) {
        logger.error(err)
      }
      logger.debug({ topics }, 'MQTT: Subscribed to topics')
    })
  }

  if (client.connected) {
    onMqttConnect()
  }

  client.on('connect', onMqttConnect)

  client.on('message', (topic, payload) => {
    let data

    try {
      data = JSON.parse(payload.toString().trim())
    } catch (_err) {
      data = payload.toString()
    }

    logger.trace({ topic, data })

    parsers[topic]?.(data)
  })

  const telegramStarted = await startTelegramBot()

  if (telegramStarted) {
    logger.info('Server initialized')
    await sendNotification('Server initialized')
  } else {
    logger.warn(
      'Server initialized without Telegram bot; notifications are disabled until the next restart'
    )
  }
})()
