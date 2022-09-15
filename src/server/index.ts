import 'dotenv/config'
import { client } from './lib/client'
import logger from './lib/logger'
import parsers from './lib/parsers'

client.once('connect', () => {
  logger.info('Client connected')
  const topics = ['shellies/#']
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
  } catch (err) {}
  logger.info({ topic, data })

  const parser = parsers[topic]

  parser?.(data)
})
