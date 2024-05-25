import { automaticTemperatureHandler } from '@lib/actions'
import {
  getDeviceKey,
  getDevicePower,
  getDeviceStatus,
  getSystemStatus,
  setDeviceKey,
  setDevicePower,
  setDeviceStatus,
  setSystemStatus,
} from '@lib/db'
import { sendNotification } from '@lib/telegram'
import { Parser, TasmotaSensorPayload } from '@lib/types'
import { DateTime } from 'luxon'
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

    if (powerGridVoltage) {
      const voltageDiff = Math.abs(powerGridVoltage - voltage)
      if (voltageDiff >= 10 && !voltageMismatch) {
        sendNotification(
          `⚡ Voltage mismatch. Power Grid: ${powerGridVoltage}v. Main voltage: ${voltage}v`,
          'HTML'
        )
        await setSystemStatus('voltageMismatch', true)
      } else if (voltageDiff < 10 && voltageMismatch) {
        sendNotification(
          `⚡ Power Grid and main voltage are back to NORMAL: ${voltage}v`,
          'HTML'
        )
        await setSystemStatus('voltageMismatch', false)
      }
    }

    if (voltage <= 202 && !lowVoltage) {
      sendNotification(`⚡ Voltage is LOW (${voltage}v)`, 'HTML')
      await setSystemStatus('lowVoltage', true)
    } else if (voltage >= 208 && lowVoltage) {
      sendNotification(`⚡ Voltage is NORMAL (${voltage}v)`, 'HTML')
      await setSystemStatus('lowVoltage', false)
    }
  }
}

export function temperatureSensorParser(deviceId: string): Parser {
  return async (payload: unknown) => {
    const data = payload as TasmotaSensorPayload
    const sensorData = data.SI7021 || data.AM2301 || data.DS18B20
    const temp = sensorData?.Temperature ?? null
    const humidity = sensorData?.Humidity ?? null

    // avoid erratic temp reports, do not allow reports +-0.5 in less than 65 seconds
    if (temp !== null) {
      const prevTempEntry = await getDeviceKey(deviceId, 'temperature')
      if (prevTempEntry && prevTempEntry.value !== null) {
        const diff = Math.abs(
          DateTime.local()
            .diff(DateTime.fromMillis(prevTempEntry?.timestamp), 'seconds')
            .as('seconds')
        )
        if (Math.abs(temp - +prevTempEntry.value) >= 0.5 && diff < 65) {
          return
        }
      }
    }

    await setDeviceKey(deviceId, 'temperature', temp ? String(temp) : null)
    await setDeviceKey(deviceId, 'humidity', humidity ? String(humidity) : null)

    await automaticTemperatureHandler()
  }
}
