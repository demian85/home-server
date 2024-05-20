import { getDevice } from 'src/config'
import { getDeviceKey, getSystemStatus, setSystemStatus } from './db'
import { sendNotification } from './telegram'
import { client as mqttClient } from '@lib/mqtt'
import { DateTime } from 'luxon'

let tempIsHigh = false
let humidityIsHigh = false

export function highTemperatureHandler(
  _deviceName: string,
  temp: number | null
) {
  if (temp === null) {
    return
  }

  if (temp >= 30 && !tempIsHigh) {
    sendNotification(`🌡️ Temperature is HIGH (${temp} C)`)
    tempIsHigh = true
  } else if (temp < 30) {
    tempIsHigh = false
  }
}

export function highHumidityHandler(
  _deviceName: string,
  humidity: number | null
) {
  if (humidity === null) {
    return
  }

  if (humidity >= 90 && !humidityIsHigh) {
    sendNotification(`🌫️ Humidity is HIGH (${humidity}%)`)
    humidityIsHigh = true
  } else if (humidity < 90) {
    humidityIsHigh = false
  }
}

export async function automaticTemperatureHandler() {
  const { autoTemp, targetTemp: currentTargetTemp } = await getSystemStatus()

  if (!autoTemp) {
    return
  }

  const outsideTemp = await getDeviceKey('wemos-garage', 'temperature')

  if (!outsideTemp || outsideTemp.value === null) {
    return
  }

  let targetTemp = +outsideTemp.value < 18 ? 20 : 18

  const hour = DateTime.local().hour

  if (hour >= 4 && hour <= 9) {
    targetTemp += 1
  }

  const targetHumidity = await getDeviceKey('mobile-heater-1', 'humidity')

  if (targetHumidity && targetHumidity.value !== null) {
    const hum = +targetHumidity.value
    if (hum > 80) {
      targetTemp -= 1
    }
    if (hum > 90) {
      targetTemp -= 0.5
    }
  }

  if (targetTemp !== currentTargetTemp) {
    const heatingDevice = getDevice('mobile-heater-1')
    await heatingDevice?.setTemperature?.(mqttClient, targetTemp)
    await sendNotification(`Automatic temperature set to ${targetTemp} C`)
    await setSystemStatus('targetTemp', targetTemp)
  }
}
