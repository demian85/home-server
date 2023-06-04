import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import logger from '@lib/logger'

import { Redis } from '@telegraf/session/redis'
import { ContextWithSession } from './types'
import handlers from './handlers'
import { ParseMode } from 'telegraf/typings/core/types/typegram'

const bot = new Telegraf<ContextWithSession>(process.env.TELEGRAM_BOT_TOKEN!)

bot.use(
  session({
    store: Redis<object>({
      url: process.env.REDIS_URL,
    }),
  })
)

bot.use((ctx, _next) => {
  logger.debug(
    {
      message: ctx.message,
      session: ctx.session,
      update: ctx.update,
      updateType: ctx.updateType,
    },
    'Middleware call'
  )

  ctx.session ??= { currentCommand: null }

  if (ctx.chat?.type !== 'private') {
    throw new Error('Bot not allowed in groups')
  }
  if (
    !ctx.chat.username ||
    !['demian85', 'SilvanaFontana'].includes(ctx.chat.username)
  ) {
    throw new Error('Forbidden')
  }

  return _next()
})

bot.start((ctx) => ctx.reply(`Welcome! I'm your home assistant`))

bot.help((ctx) => ctx.reply('What do you need?'))

bot.command('abort', async (ctx) => {
  ctx.session.currentCommand = null
  await ctx.reply(`Current operation aborted`)
})

bot.command('food', async (ctx) => {
  await handlers.food.message[0](ctx)
})

bot.command('temperature', async (ctx) => {
  await handlers.temperature.message[0](ctx)
})

bot.on(message('text'), async (ctx) => {
  const prompt = ctx.message.text

  if (!prompt) {
    return ctx.reply(`I can't do anything with an empty command`)
  }

  const cmd = ctx.session.currentCommand

  if (cmd !== null) {
    const cmdId = cmd.id as keyof typeof handlers
    await handlers?.[cmdId].message[cmd.step](ctx)
  }
})

bot.on('callback_query', async (ctx) => {
  const cmd = ctx.session.currentCommand

  if (!cmd) {
    return ctx.answerCbQuery('Invalid callback')
  }

  const cmdId = cmd.id as keyof typeof handlers
  const handler = handlers?.[cmdId].callbackQuery[cmd.step]

  // @ts-ignore
  if (handler) {
    return handler(ctx)
  }

  return ctx.answerCbQuery('Invalid callback')
})

bot.on('inline_query', async (ctx) => {
  await ctx.answerInlineQuery([])
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

export async function sendNotification(text: string, parseMode?: ParseMode) {
  return bot.telegram.sendMessage(
    process.env.TELEGRAM_NOTIFICATIONS_TARGET!,
    text,
    { parse_mode: parseMode }
  )
}

export default bot
