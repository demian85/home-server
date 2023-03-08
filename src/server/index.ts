import 'dotenv/config'

import { client } from '@lib/client'
import logger from '@lib/logger'
import parsers from '@lib/parsers'
import config from '../config'

client.once('connect', () => {
  logger.info('Client connected')

  const topics = config.subscriptions.concat(
    config.devices.reduce((prev, curr) => {
      prev = prev.concat(curr.subscriptions)
      return prev
    }, [] as string[])
  )

  client.subscribe(topics, (err, granted) => {
    if (err) {
      logger.error(err)
    }
    logger.info({ topics }, 'Subscribed to topics')
  })
})

client.on('message', (topic, payload) => {
  let data
  try {
    data = JSON.parse(payload.toString().trim())
  } catch (err) {
    data = payload.toString()
  }
  logger.info({ topic, data })

  const parser = parsers[topic]

  parser?.(data)
})
