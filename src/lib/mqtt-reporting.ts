import config from '../config.js'
import logger, { withLogContext } from '@lib/logger.js'
import { errorDetails } from '@lib/log-error.js'
import { client } from '@lib/mqtt.js'
import type { Parser } from '@lib/types.js'

type SubscriptionState =
  | 'waiting'
  | 'unconfigured'
  | 'pending'
  | 'partial'
  | 'failed'
  | 'confirmed'

let subscriptionState: SubscriptionState = 'waiting'
let lastSubscriptionAttemptAt: string | null = null
const status = {
  messagesReceived: 0,
  messagesHandled: 0,
  parserFailures: 0,
  lastMessageAt: null as string | null,
  lastHandledAt: null as string | null,
}

export function getMqttReportingStatus() {
  return {
    ...status,
    subscriptionState: client.connected ? subscriptionState : 'disconnected',
    lastSubscriptionAttemptAt,
  }
}

export function startMqttReporting(parsers: Record<string, Parser>) {
  const topics = [
    ...new Set([
      ...config.subscriptions,
      ...config.devices.flatMap((device) => device.subscriptions),
    ]),
  ]

  function subscribe() {
    if (!topics.length) {
      subscriptionState = 'unconfigured'
      logger.warn('No MQTT subscription filters configured')
      return
    }
    subscriptionState = 'pending'
    lastSubscriptionAttemptAt = new Date().toISOString()
    client.subscribe(topics, (error, grants) => {
      if (error) {
        subscriptionState = 'failed'
        logger.error(
          { ...errorDetails(error), topicCount: topics.length },
          'MQTT subscription failed'
        )
        return
      }
      const accepted = new Set(
        grants
          .filter(({ qos }) => qos >= 0 && qos <= 2)
          .map(({ topic }) => topic)
      )
      const refusedTopics = topics.filter((topic) => !accepted.has(topic))
      if (refusedTopics.length) {
        subscriptionState = accepted.size ? 'partial' : 'failed'
        logger.error(
          { acceptedCount: accepted.size, refusedTopics },
          'MQTT subscription filters unconfirmed'
        )
        return
      }
      subscriptionState = 'confirmed'
      logger.info({ topicCount: accepted.size }, 'MQTT subscriptions confirmed')
    })
  }

  client.on('message', async (topic, payload) => {
    status.messagesReceived++
    status.lastMessageAt = new Date().toISOString()
    if (!Object.hasOwn(parsers, topic)) {
      logger.trace(
        { topic: topic.slice(0, 256), payloadBytes: payload.length },
        'MQTT topic has no parser'
      )
      return
    }

    const text = payload.toString()
    let data: unknown
    try {
      data = JSON.parse(text.trim())
    } catch {
      data = text
    }

    try {
      await withLogContext({ topic }, () => parsers[topic](data))
      status.messagesHandled++
      status.lastHandledAt = new Date().toISOString()
      logger.trace(
        { topic, payloadBytes: payload.length },
        'MQTT message handled'
      )
    } catch (error) {
      status.parserFailures++
      logger.error(
        { topic, payloadBytes: payload.length, ...errorDetails(error) },
        'MQTT message handler failed'
      )
    }
  })
  client.on('connect', subscribe)
  if (client.connected) subscribe()
}
