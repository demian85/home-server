import type { CallbackQuery } from 'telegraf/types'
import config, { getDevice } from '../../../../config'
import { CallbackQueryContext, MessageContext } from '../types'
import { client as mqttClient } from '@lib/mqtt'
import { setSystemStatus } from '@lib/db'
import { automaticTemperatureHandler } from '@lib/actions'

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
  ],
  callbackQuery: [
    // step = 0
    async (ctx: CallbackQueryContext) => {
      const cmd = ctx.session.currentCommand!
      cmd.step = 1
      cmd.data = (ctx.callbackQuery as CallbackQuery.DataQuery).data
      await ctx.answerCbQuery('')
      const keyboardButtons = [
        [
          {
            text: '18 C',
            callback_data: '18',
          },
          {
            text: '19 C',
            callback_data: '19',
          },
          {
            text: '20 C',
            callback_data: '20',
          },
        ],
        [
          {
            text: '♨️ 21 C',
            callback_data: '21',
          },
          {
            text: '♨️ 22 C',
            callback_data: '22',
          },
          {
            text: 'Automatic',
            callback_data: 'auto',
          },
        ],
      ]
      await ctx.editMessageText('Select the target temperature', {
        reply_markup: { inline_keyboard: keyboardButtons },
      })
    },
    // step = 1
    async (ctx: CallbackQueryContext) => {
      await ctx.answerCbQuery('')
      const cmd = ctx.session.currentCommand!
      const temp = (ctx.callbackQuery as CallbackQuery.DataQuery).data

      if (temp === 'auto') {
        await setSystemStatus('autoTemp', 'true')
        await ctx.editMessageText(`🌡️ Automatic temperature mode enabled`)
      } else if (+temp > 0) {
        const device = getDevice(cmd.data)

        if (!device) {
          ctx.reply('Device not found')
          return
        }

        await setSystemStatus('autoTemp', 'false')

        await device.setTemperature?.(mqttClient, +temp)
        const srcUrl = device.url
        const srcStr = srcUrl ? `[${device.name}](${srcUrl})` : device.name
        await ctx.editMessageText(
          `🌡️ New temperature set for device ${srcStr}: ${temp} C`,
          { parse_mode: 'MarkdownV2' }
        )
      }

      // reset target temp to force calculation
      await setSystemStatus('targetTemp', null)
      await automaticTemperatureHandler()

      ctx.session.currentCommand = null
    },
  ],
}
