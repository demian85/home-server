import { MessageContext } from '../types'
import { getSystemStatus } from '@lib/db'

export default {
  message: [
    // step = 0
    async (ctx: MessageContext) => {
      ctx.session.currentCommand = { id: 'system', step: 0 }
      const system = await getSystemStatus()
      await ctx.reply(`System config: <code>${JSON.stringify(system)}</code>`, {
        parse_mode: 'HTML',
      })
    },
  ],
  callbackQuery: [],
}
