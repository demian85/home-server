import { setTimeout as sleep } from 'node:timers/promises'
import { AbortController as TelegramAbortController } from 'abort-controller'
import { TelegramError } from 'telegraf'
import { errorDetails } from '@lib/log-error.js'
import logger from '@lib/logger.js'
import bot, { sendNotification } from './index.js'

const LONG_POLL_SECONDS = 50
const NETWORK_GRACE_MS = 15_000
const MAX_BACKOFF_MS = 60_000

type PollingState = 'starting' | 'polling' | 'retrying' | 'failed' | 'stopped'
let state: PollingState = 'stopped'
let lastSuccessfulPollAt: string | null = null

export function getTelegramPollingStatus() {
  return { state, lastSuccessfulPollAt }
}

async function telegramRequest<T>(
  signal: AbortSignal | undefined,
  timeoutMs: number,
  request: (controller: TelegramAbortController) => Promise<T>
): Promise<T> {
  const controller = new TelegramAbortController()
  const abort = () => controller.abort()
  if (signal?.aborted) abort()
  signal?.addEventListener('abort', abort, { once: true })
  const timer = setTimeout(abort, timeoutMs)
  try {
    return await request(controller)
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
  }
}

function isTransient(error: unknown) {
  if (error instanceof TelegramError) {
    return error.code === 429 || error.code >= 500
  }
  return (
    error instanceof Error && ['FetchError', 'AbortError'].includes(error.name)
  )
}

export async function runTelegramPolling(signal: AbortSignal): Promise<void> {
  let configured = false
  let offset = 0
  let pendingAck = false
  let backoffMs = 2_000
  lastSuccessfulPollAt = null
  state = 'starting'
  while (!signal.aborted) {
    try {
      if (!configured) {
        bot.botInfo ??= await telegramRequest(
          signal,
          NETWORK_GRACE_MS,
          (options) => bot.telegram.callApi('getMe', {}, options)
        )
        await telegramRequest(signal, NETWORK_GRACE_MS, (options) =>
          bot.telegram.callApi('deleteWebhook', {}, options)
        )
        configured = true
      }
      const timeout = state === 'polling' ? LONG_POLL_SECONDS : 0
      const updates = await telegramRequest(
        signal,
        timeout * 1000 + NETWORK_GRACE_MS,
        (options) =>
          bot.telegram.callApi(
            'getUpdates',
            { offset, timeout, allowed_updates: [] },
            options
          )
      )
      pendingAck = false
      if (signal.aborted) break
      if (lastSuccessfulPollAt === null) {
        logger.info('Telegram polling started')
        void sendNotification('Server initialized')
      } else if (state === 'retrying') {
        logger.info('Telegram polling recovered')
      }
      state = 'polling'
      lastSuccessfulPollAt = new Date().toISOString()
      backoffMs = 2_000
      await Promise.all(updates.map((update) => bot.handleUpdate(update)))
      const lastUpdate = updates.at(-1)
      if (lastUpdate) {
        offset = lastUpdate.update_id + 1
        pendingAck = true
      }
    } catch (error) {
      if (signal.aborted) break
      if (!isTransient(error)) {
        state = 'failed'
        throw error
      }
      state = 'retrying'
      const retryAfter =
        error instanceof TelegramError
          ? error.parameters?.retry_after
          : undefined
      const delayMs = Math.max(backoffMs, (retryAfter ?? 0) * 1000)
      logger.warn(
        { ...errorDetails(error), delayMs },
        'Telegram polling failed, retrying'
      )
      backoffMs = Math.min(MAX_BACKOFF_MS, backoffMs * 2)
      try {
        await sleep(delayMs, undefined, { signal })
      } catch (sleepError) {
        if (!signal.aborted) throw sleepError
      }
    }
  }
  state = 'stopped'
  if (pendingAck) {
    // Confirm the processed batch without consuming new arrivals during shutdown.
    try {
      await telegramRequest(undefined, 3_000, (options) =>
        bot.telegram.callApi(
          'getUpdates',
          { offset, limit: 1, timeout: 0 },
          options
        )
      )
    } catch (error) {
      logger.warn(
        errorDetails(error),
        'Could not confirm Telegram update offset at shutdown'
      )
    }
  }
}
