import 'dotenv/config'

import { client } from '@lib/mqtt'
import logger from '@lib/logger'
import { loadParsers } from '@lib/parsers'
import config from '../config.js'
import telegramBot, { sendNotification } from '@lib/telegram'
import { connectRedis } from '@lib/db'

/////------------------------------------
;(async function init() {
  await connectRedis()

  const parsers = await loadParsers()

  logger.debug(Object.keys(parsers))

  function onMqttConnect() {
    logger.info('Client connected')

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
      logger.debug({ topics }, 'Subscribed to topics')
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

  telegramBot.launch(() => {
    logger.info('Telegram bot is up and running')
  }).catch((error: any) => {
    if (error?.response?.error_code === 409) {
      logger.error(
        { error: error.message },
        'Another bot instance is already running (409 Conflict). Kill all node processes and try again.'
      )
      throw new Error(
        'Telegram bot 409 Conflict: Another instance is already running. Run: pkill -f "ai-telegram-assistant-bot.*tsx" && sleep 2'
      )
    }
    throw error
  })

  logger.info('Server initialized')
  await sendNotification('Server initialized')
})()
