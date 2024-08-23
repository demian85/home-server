import { getDevice } from 'src/config'
import { getDeviceKey, getSystemStatus, setSystemStatus } from './db'
import { sendNotification } from './telegram'
import { client as mqttClient } from '@lib/mqtt'
import { DateTime } from 'luxon'

export async function automaticTemperatureHandler() {
  const { autoTemp, targetTemp: currentTargetTemp } = await getSystemStatus()

  if (!autoTemp) {
    return
  }

  const outsideTemp = await getDeviceKey('wemos-garage', 'temperature')

  if (!outsideTemp || outsideTemp.value === null) {
    return
  }

  const baseTemp = 20 // base temperature for sleeping

  let targetTemp = baseTemp

  if (
    DateTime.fromMillis(outsideTemp.timestamp).diffNow().as('minutes') <= -30
  ) {
    targetTemp += +outsideTemp.value < 8 ? 0.5 : 0
  }

  const today = DateTime.local()
  const hour = today.hour
  const weekDay = today.weekday

  if (weekDay >= 1 && weekDay <= 5) {
    // mon-fri
    if (hour >= 4 && hour <= 7) {
      targetTemp += 0.3
    }
    if (hour >= 5 && hour <= 7) {
      targetTemp += 0.2
    }
  }

  if (weekDay >= 6 && weekDay <= 7) {
    // weekends
    if (hour >= 4 && hour <= 9) {
      targetTemp += 0.3
    }
    if (hour >= 5 && hour <= 9) {
      targetTemp += 0.2
    }
  }

  // day mode, reduce temp except for nap time
  // if ((hour >= 10 && hour <= 12) || (hour >= 15 && hour <= 17)) {
  //   targetTemp -= 1
  // }

  // warmer at nap time and noon
  if ((hour >= 19 && hour <= 21) || (hour >= 13 && hour <= 15)) {
    targetTemp += 1
  }

  const targetHumidity = await getDeviceKey('mobile-heater-1', 'humidity')

  if (targetHumidity && targetHumidity.value !== null) {
    const hum = +targetHumidity.value
    if (hum > 75) {
      targetTemp -= 0.3
    }
    if (hum > 80) {
      targetTemp -= 0.3
    }
    if (hum > 90) {
      targetTemp -= 0.4
    }
  }

  if (targetTemp !== currentTargetTemp) {
    const heatingDevice = getDevice('mobile-heater-1')
    await heatingDevice?.setTemperature?.(mqttClient, targetTemp)
    await sendNotification(`🌡️ Automatic temperature set to ${targetTemp} C`)
    await setSystemStatus('targetTemp', targetTemp)
  }
}
