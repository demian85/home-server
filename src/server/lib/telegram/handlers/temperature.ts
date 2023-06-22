import { CallbackQuery } from 'telegraf/typings/core/types/typegram'
import config from '../../../../config'
import { CallbackQueryContext, MessageContext } from '../types'
import { client as mqttClient } from '@lib/mqtt'

export default {
  message: [
    // step = 0
    async (ctx: MessageContext) => {
      ctx.session.currentCommand = { id: 'temperature', step: 0 }
      const editableDevices = config.devices.filter(
        (device) => !!device.setTemperature
      )
      const keyboardButtons = editableDevices.map((device) => ({
        text: device.name,
        callback_data: device.id,
      }))
      await ctx.reply(`Choose the device you want to modify`, {
        reply_markup: { inline_keyboard: [keyboardButtons] },
      })
    },
    // step = 1
    async (ctx: MessageContext) => {
      const cmd = ctx.session.currentCommand!
      const device = config.devices.find((d) => d.id === cmd.data)
      const temp = +ctx.message.text

      if (isNaN(temp)) {
        ctx.reply(`${temp} is not a valid number`)
        return
      }

      if (device) {
        await device.setTemperature?.(mqttClient, temp)
        await ctx.reply(
          `New temperature set for device <b>${device.name}</b>: ${temp} C`,
          { parse_mode: 'HTML' }
        )
      }

      ctx.session.currentCommand = null
    },
  ],
  callbackQuery: [
    // step = 0
    async (ctx: CallbackQueryContext) => {
      const cmd = ctx.session.currentCommand!
      cmd.step = 1
      cmd.data = (ctx.callbackQuery as CallbackQuery.DataQuery).data
      await ctx.answerCbQuery('Send me the new value')
    },
  ],
}
