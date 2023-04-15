import 'dotenv/config'

import { client } from '@lib/client'
import logger from '@lib/logger'
import { loadParsers } from '@lib/parsers'
import config from '../config'
import telegramBot from '@lib/telegram'

/////------------------------------------
;(async function init() {
  const parsers = await loadParsers()

  logger.debug(Object.keys(parsers))

  client.once('connect', () => {
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
  })

  client.on('message', (topic, payload) => {
    let data
    try {
      data = JSON.parse(payload.toString().trim())
    } catch (err) {
      data = payload.toString()
    }
    logger.debug({ topic, data })

    const parser = parsers[topic]

    parser?.(data)
  })

  telegramBot.launch()
})()
