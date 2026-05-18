import config from '../../../../config.js'
import { MessageContext } from '../types.js'
import { getDeviceKey, getSystemStatus } from '@lib/db'
import { DateTime } from 'luxon'

export default {
  message: [
    // step = 0
    async (ctx: MessageContext) => {
      ctx.session.currentCommand = { id: 'system', step: 0 }
      const system = await getSystemStatus()
      const heatingDevices = config.devices.filter((v) => !!v.setTemperature)
      const outputEntries = Object.entries(system).map(([k, v]) => {
        return `<code>${k}: ${v}</code>`
      })

      for (const d of heatingDevices) {
        outputEntries.push(...(await getSensorDataEntries(d.id, d.name)))
      }

      outputEntries.push(
        ...(await getSensorDataEntries('wemos-garage', 'Outdoor sensors'))
      )
      outputEntries.push(
        ...(await getSensorDataEntries('wemos-office', 'Office'))
      )

      await ctx.reply(`<b>System</b>\n${outputEntries.join('\n')}`, {
        parse_mode: 'HTML',
      })
    },
  ],
  callbackQuery: [],
}

async function getSensorDataEntries(
  deviceId: string,
  deviceName: string
): Promise<string[]> {
  const outputEntries = []
  const temp = (await getDeviceKey(deviceId, 'temperature')) ?? null
  const hum = (await getDeviceKey(deviceId, 'humidity')) ?? null

  outputEntries.push(`<b>${deviceName}</b>`)

  if (temp && temp.value !== null) {
    outputEntries.push(
      `<code>- Temperature: ${temp.value} C${
        DateTime.fromMillis(temp.timestamp).diffNow('minutes').as('minutes') <
        -5
          ? '(outdated)'
          : ''
      }</code>`
    )
  }
  if (hum && hum.value !== null) {
    outputEntries.push(
      `<code>- Humidity: ${hum.value}%${
        DateTime.fromMillis(hum.timestamp).diffNow('minutes').as('minutes') < -5
          ? ' (outdated)'
          : ''
      }</code>`
    )
  }

  if (outputEntries.length === 1) {
    outputEntries.push(`<code>(no data)</code>`)
  }

  return outputEntries
}
