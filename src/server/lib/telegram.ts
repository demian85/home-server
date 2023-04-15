import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import logger from '@lib/logger'
import { redisClient } from './db'
import { DEFAULT_MODEL, chatCompletion } from './openai'
import { capitalize, groupBy } from 'lodash'
import { DateTime } from 'luxon'

interface FoodStockItem {
  name: string
  category: string
  stock: number
  expiry: string
}

type FoodStockList = FoodStockItem[]

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!)

bot.start((ctx) => ctx.reply(`Welcome! I'm your home assistant`))
bot.help((ctx) => ctx.reply('What do you need?'))

bot.use((ctx, _next) => {
  logger.debug({ message: ctx.message }, 'Middleware call')

  if (ctx.chat?.type !== 'private') {
    throw new Error('Bot not allowed in groups')
  }
  if (
    !ctx.chat.username ||
    !['demian85', 'SilvanaFontana'].includes(ctx.chat.username)
  ) {
    throw new Error('Forbidden')
  }
  _next()
})

bot.command('food', async (ctx) => {
  const list = await getFoodStock()
  const listStr = formatFoodStock(list)
  logger.debug({ list })
  await ctx.reply(`This is your current stock:\n${listStr}`)
})

bot.on(message('text'), async (ctx) => {
  const prompt = ctx.message.text

  if (!prompt) {
    ctx.reply(`I can't do anything with an empty command`)
    return
  }

  const currentFoodStock = await getFoodStock()

  const openAIprompt = `
  Actúa como un experto desarrollador full-stack. Debes interpretar y modificar el JSON recibido (que representa un inventario de items con sus respectivas propiedades).
  Debes responder solamente con un JSON idéntico al recibido entre corchetes [], pero con el estado final del inventario, basándote en la acción efectuada entre paréntesis ()
  Las acciones posibles son:
  - Agregar item, opcionalmente con el stock y fecha de caducidad (expiry) en formato ISO. La fecha indicada puede ser relativa con respecto al día de hoy e indicada en días.
  - Incrementar el stock
  - Reducir el stock
  Usar, consumir, quitar o cocinar significa reducir el stock. 
  Comprar, agregar o sumar significa incrementar el stock.
  Se puede incrementar o reducir el stock usando unidades enteras solamente. 
  No habrá dos campos de stock, solo uno que siempre se actualizará.
  No se pueden repetir items por su nombre.
  La fecha de hoy en formato ISO es: ${DateTime.local().toISO()}
  ${JSON.stringify(currentFoodStock)}
  (${prompt})`

  const completion = await chatCompletion({
    model: DEFAULT_MODEL,
    messages: [{ role: 'user', content: openAIprompt }],
  })

  try {
    const finalItems = JSON.parse(completion.trim()) as FoodStockList
    const finalItemsStr = formatFoodStock(finalItems)
    await redisClient.set('home_server:food:list', JSON.stringify(finalItems))
    ctx.reply(`${finalItemsStr}`)
  } catch (err) {
    logger.error({ err }, 'An error occurred while parsing the response JSON')
  }
})

bot.on('callback_query', async (ctx) => {
  await ctx.answerCbQuery()
})

bot.on('inline_query', async (ctx) => {
  await ctx.answerInlineQuery([])
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

function formatFoodStock(inputItems: FoodStockList): string {
  const groupedItems = groupBy(inputItems, (v) => capitalize(v.category))
  const noStockItems: string[] = []
  let finalItemsStr = Object.entries(groupedItems)
    .map(([k, v]) => {
      const items = v
        .map((i) => {
          if (i.stock === 0) {
            noStockItems.push(i.name)
          }
          const expiry = i.expiry
            ? `(Exp: in ${Math.abs(
                DateTime.fromISO(i.expiry).diffNow('days').days
              ).toFixed(0)} days)`
            : ''
          return `- ${i.name}: ${i.stock} ${expiry}`
        })
        .join('\n')
      return `${k}:\n${items}`
    })
    .join('\n\n')
  if (noStockItems.length > 0) {
    finalItemsStr += `\n\nNo hay stock de los siguientes items: ${noStockItems.join(
      ', '
    )}`
  }
  return finalItemsStr
}

async function getFoodStock(): Promise<FoodStockList> {
  const stock = await redisClient.get('home_server:food:list')
  const list: FoodStockList = stock ? JSON.parse(stock) : []
  return list
}

export default bot
