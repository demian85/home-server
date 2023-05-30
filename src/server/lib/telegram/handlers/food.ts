import { redisClient } from '@lib/db'
import logger from '@lib/logger'
import { chatCompletion, DEFAULT_MODEL } from '@lib/openai'
import { DateTime } from 'luxon'
import { ContextWithSession, FoodStockList } from '../types'
import { groupBy, capitalize } from 'lodash'

export default {
  message: [
    async (ctx: ContextWithSession) => {
      ctx.session.currentCommand = { id: 'food', step: 0 }
      const list = await getFoodStock()
      const listStr = formatFoodStock(list)
      logger.debug({ list })
      await ctx.reply(`This is your current stock:\n${listStr}`)
    },
    async (ctx: ContextWithSession) => {
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
        await redisClient.set(
          'home_server:food:list',
          JSON.stringify(finalItems)
        )
        ctx.reply(`${finalItemsStr}`)
      } catch (err) {
        logger.error(
          { err },
          'An error occurred while parsing the response JSON'
        )
      }
    },
  ],
  callbackQuery: [],
}

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
