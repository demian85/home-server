import {
  getDevicePower,
  getDeviceStatus,
  getSystemStatus,
  setDevicePower,
  setDeviceStatus,
  setSystemStatus,
} from '@lib/db'
import { sendNotification } from '@lib/telegram'
import { Parser, TasmotaSensorPayload } from '@lib/types'
import config from 'src/config'

export function lwtParser(deviceId: string, deviceName: string): Parser {
  return async (payload: unknown) => {
    const newStatus = String(payload).toLowerCase()
    const currStatus = await getDeviceStatus(deviceId)
    if (newStatus !== currStatus?.value) {
      await setDeviceStatus(deviceId, newStatus)
      if (newStatus === 'offline') {
        await setDevicePower(deviceId, 'off')
      }
      await sendNotification(
        `<b>${deviceName}</b> is ${
          newStatus === 'online' ? 'online 🟢' : 'offline 🔴'
        }`,
        'HTML'
      )
    }
  }
}

export function powerParser(deviceId: string, deviceName: string): Parser {
  return async (payload: unknown) => {
    const newStatus = String(payload).toLowerCase()
    const currStatus = await getDevicePower(deviceId)
    const powerValue = payload as string
    if (newStatus !== currStatus?.value) {
      await setDevicePower(deviceId, newStatus)
      const srcUrl = config.devices.find((v) => v.id === deviceId)?.url
      const srcStr = srcUrl ? `[${deviceName}](${srcUrl})` : deviceName
      await sendNotification(
        `${srcStr} reported: Power ${powerValue}`,
        'MarkdownV2'
      )
    }
  }
}

export function voltageParser(): Parser {
  return async (payload: unknown) => {
    const data = payload as TasmotaSensorPayload
    const voltage = data?.ENERGY?.Voltage ?? 0

    if (voltage === 0) {
      return
    }

    const { lowVoltage } = await getSystemStatus()

    await setSystemStatus('voltage', voltage)

    if (
      voltage <= 205 &&
      (lowVoltage === 'false' || lowVoltage === undefined)
    ) {
      sendNotification(
        `⚡ <b>Energy Watcher</b>: Voltage is LOW (${voltage}v)`,
        'HTML'
      )
      await setSystemStatus('lowVoltage', true)
    } else if (
      voltage >= 212 &&
      (lowVoltage === 'true' || lowVoltage === undefined)
    ) {
      sendNotification(
        `⚡ <b>Energy Watcher</b>: Voltage is NORMAL (${voltage}v)`,
        'HTML'
      )
      await setSystemStatus('lowVoltage', false)
    }
  }
}
