import {
  getDevice,
  getHeatingDevice,
  getRoomsWithTargetTemp,
  getSensorDevice,
} from '../../config'
import {
  getDeviceKey,
  getDeviceStatus,
  getSystemStatus,
  setSystemStatus,
} from './db'
import { sendNotification } from './telegram'
import { client as mqttClient } from '@lib/mqtt'
import { DateTime } from 'luxon'

export async function automaticTemperatureHandler() {
  const { autoTemp, lowVoltage } = await getSystemStatus()

  if (!autoTemp) {
    return
  }

  const outsideTemp = await getDeviceKey('laundry-sensors', 'temperature')

  const targetHumidity = (
    await Promise.all([
      getDeviceKey('mobile-heater-1', 'humidity'),
      getDeviceKey('iotero-sht40-sensor-1', 'humidity'),
      getDeviceKey('iotero-sht40-sensor-2', 'humidity'),
    ])
  ).find((v) => v && v.value !== null) as { value: string }
  const hum = +targetHumidity.value

  // Find target temp per room
  const roomsWithHeatingDevices = getRoomsWithTargetTemp()

  for (const room of roomsWithHeatingDevices) {
    let targetTemp = room.temp
    const heater = getHeatingDevice(room.id)
    const sensorDevice = getSensorDevice(room.id)

    if (!heater || !sensorDevice) {
      continue
    }

    const currentRoomTemp = await getDeviceKey(sensorDevice.id, 'temperature')

    if (!currentRoomTemp?.value) {
      continue
    }

    if (!targetTemp || lowVoltage) {
      await heater.sendCommand(mqttClient, 'POWER', '0')
      await sendNotification(`🌡️ (${heater.name}) Power OFF`)
      continue
    }

    if (targetTemp && !lowVoltage) {
      if (
        outsideTemp &&
        outsideTemp.value !== null &&
        DateTime.fromMillis(outsideTemp.timestamp).diffNow().as('minutes') <=
          -30
      ) {
        targetTemp += +outsideTemp.value < 8 ? 0.5 : 0
      }
      if (hum > 75) {
        targetTemp -= 0.3
      }
      if (hum > 80) {
        targetTemp -= 0.3
      }
      if (hum > 90) {
        targetTemp -= 0.4
      }
      const shouldPowerOn = +currentRoomTemp.value <= targetTemp + 0.5
      await heater.sendCommand(mqttClient, 'POWER', shouldPowerOn ? '1' : '0')
      await sendNotification(
        `🌡️ (${heater.name}) Power ON. Current temperature: ${currentRoomTemp.value} C`
      )
      continue
    }
  }
}
