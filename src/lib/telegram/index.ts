import { AbortController } from 'abort-controller'
import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { z } from 'zod'
import { errorDetails } from '@lib/log-error.js'
import logger, { withLogContext } from '@lib/logger.js'
import { redisClient } from '@lib/db.js'

import { ContextWithSession } from './types.js'
import handlers from './handlers/index.js'
import type { ParseMode } from 'telegraf/types'

const bot = new Telegraf<ContextWithSession>(process.env.TELEGRAM_BOT_TOKEN!)

bot.catch((error, ctx) => {
  logger.error(
    { ...errorDetails(error), updateId: ctx.update.update_id },
    'Telegram update failed'
  )
})

bot.use((ctx, next) =>
  withLogContext({ updateId: ctx.update.update_id }, async () => {
    const fields = { updateType: ctx.updateType }
    if (
      ctx.chat?.type !== 'private' ||
      !ctx.chat.username ||
      !['demian85', 'SilvanaFontana'].includes(ctx.chat.username)
    ) {
      logger.debug(fields, 'Ignored Telegram update outside allowed chats')
      return
    }

    logger.debug(fields, 'Telegram update received')
    await next()
    logger.debug(fields, 'Telegram update completed')
  })
)

const sessionSchema = z.object({
  currentCommand: z
    .object({
      id: z.string().refine((id) => Object.hasOwn(handlers, id)),
      step: z.int().nonnegative(),
      data: z.string().optional(),
    })
    .nullable(),
})

// Telegraf 4 caches rejected store reads. Resolve outages with an identity
// marker so the next update retries Redis without overwriting the session.
const unavailableSession = { currentCommand: null }

bot.use(
  session({
    defaultSession: () => ({ currentCommand: null }),
    store: {
      async get(key) {
        let value: string | null
        try {
          value = await redisClient.get(`telegraf:${key}`)
        } catch (error) {
          logger.error(errorDetails(error), 'Telegram session read failed')
          return unavailableSession
        }
        if (value === null) return undefined
        try {
          return sessionSchema.parse(JSON.parse(value))
        } catch {
          logger.warn('Discarding invalid Telegram session')
          return undefined
        }
      },
      async set(key, session) {
        if (session !== unavailableSession) {
          await redisClient.set(`telegraf:${key}`, JSON.stringify(session))
        }
      },
      async delete(key) {
        await redisClient.del(`telegraf:${key}`)
      },
    },
  })
)
bot.drop((ctx) => ctx.session === unavailableSession)

bot.command(
  ['start', 'help', 'abort', ...Object.keys(handlers)],
  (ctx, next) => {
    logger.debug({ command: ctx.command, step: 0 }, 'Routing Telegram command')
    return next()
  }
)

bot.start((ctx) => ctx.reply(`Welcome! I'm your home assistant`))

bot.help((ctx) => ctx.reply('What do you need?'))

bot.command('abort', async (ctx) => {
  ctx.session.currentCommand = null
  await ctx.reply(`Current operation aborted`)
})

bot.command('temperature', async (ctx) => {
  await handlers.temperature.message[0](ctx)
})

bot.command('system', async (ctx) => {
  await handlers.system.message[0](ctx)
})

bot.on(message('text'), async (ctx) => {
  const prompt = ctx.message.text

  if (!prompt) {
    return ctx.reply(`I can't do anything with an empty command`)
  }

  const cmd = ctx.session.currentCommand

  if (cmd !== null) {
    const handler = handlers[cmd.id]?.message[cmd.step]
    if (handler) {
      logger.debug({ command: cmd.id, step: cmd.step }, 'Routing Telegram text')
      await handler(ctx)
    }
  }
})

bot.on('callback_query', async (ctx) => {
  const cmd = ctx.session.currentCommand

  if (!cmd) {
    return ctx.answerCbQuery('Invalid callback')
  }

  const handler = handlers[cmd.id]?.callbackQuery[cmd.step]

  if (handler) {
    logger.debug(
      { command: cmd.id, step: cmd.step },
      'Routing Telegram callback'
    )
    return handler(ctx)
  }

  return ctx.answerCbQuery('Invalid callback')
})

bot.on('inline_query', async (ctx) => {
  await ctx.answerInlineQuery([])
})

function escapeMarkdownV2(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()]/g, '\\$&')
}

const notificationTimeoutMs = 15_000
const notificationStatus: {
  lastAttemptAt: string | null
  lastSuccessAt: string | null
  inFlight: number
  failures: number
} = {
  lastAttemptAt: null,
  lastSuccessAt: null,
  inFlight: 0,
  failures: 0,
}

export function getNotificationStatus() {
  return { ...notificationStatus }
}

export async function sendNotification(text: string, parseMode?: ParseMode) {
  const escapedText =
    parseMode === 'MarkdownV2'
      ? escapeMarkdownV2(text)
      : parseMode === 'Markdown'
        ? escapeMarkdown(text)
        : text

  const startedAt = Date.now()
  notificationStatus.lastAttemptAt = new Date(startedAt).toISOString()
  notificationStatus.inFlight++
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), notificationTimeoutMs)
  const { signal } = controller
  try {
    const result = await bot.telegram.callApi(
      'sendMessage',
      {
        chat_id: process.env.TELEGRAM_NOTIFICATIONS_TARGET!,
        text: escapedText,
        parse_mode: parseMode,
      },
      { signal }
    )
    notificationStatus.lastSuccessAt = new Date().toISOString()
    logger.debug(
      { durationMs: Date.now() - startedAt },
      'Telegram notification sent'
    )
    return result
  } catch (error) {
    notificationStatus.failures++
    logger.error(
      {
        ...errorDetails(error),
        timedOut: signal.aborted,
        durationMs: Date.now() - startedAt,
      },
      'Failed to send Telegram notification'
    )
  } finally {
    clearTimeout(timer)
    notificationStatus.inFlight--
  }
}

export default bot
