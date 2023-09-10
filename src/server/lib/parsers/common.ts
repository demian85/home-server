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

    const { lowVoltage, powerGridVoltage, voltageMismatch } =
      await getSystemStatus()

    await setSystemStatus('voltage', voltage)

    if (powerGridVoltage !== undefined) {
      const voltageDiff = Math.abs(+powerGridVoltage - voltage)
      if (
        voltageDiff >= 5 &&
        (voltageMismatch === 'false' || voltageMismatch === undefined)
      ) {
        sendNotification(
          `⚡ Voltage mismatch. Power Grid: ${powerGridVoltage}v. Main voltage: ${voltage}v`,
          'HTML'
        )
        await setSystemStatus('voltageMismatch', true)
      } else if (
        voltageDiff < 5 &&
        (voltageMismatch === 'true' || voltageMismatch === undefined)
      ) {
        sendNotification(
          `⚡ Power Grid and main voltage are back to NORMAL`,
          'HTML'
        )
        await setSystemStatus('voltageMismatch', false)
      }
    }

    if (
      voltage <= 202 &&
      (lowVoltage === 'false' || lowVoltage === undefined)
    ) {
      sendNotification(`⚡ Voltage is LOW (${voltage}v)`, 'HTML')
      await setSystemStatus('lowVoltage', true)
    } else if (
      voltage >= 208 &&
      (lowVoltage === 'true' || lowVoltage === undefined)
    ) {
      sendNotification(`⚡ Voltage is NORMAL (${voltage}v)`, 'HTML')
      await setSystemStatus('lowVoltage', false)
    }
  }
}
