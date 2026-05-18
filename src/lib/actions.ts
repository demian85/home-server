import {
  getHeatingDevice,
  getRoomsWithTargetTemp,
  getSensorDevice,
} from '../config.js'
import { getDeviceKey, getSystemStatus } from './db.js'
import { sendNotification } from './telegram/index.js'
import { client as mqttClient } from '@lib/mqtt.js'
import { DateTime } from 'luxon'

export async function automaticTemperatureHandler() {
  const { autoTemp, lowVoltage } = await getSystemStatus()

  if (!autoTemp) {
    return
  }

  const outsideTemp = await getDeviceKey('laundry-sensors', 'temperature')

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
    const currentRoomHumidity = await getDeviceKey(sensorDevice.id, 'humidity')

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
      if (currentRoomHumidity?.value) {
        const hum = +currentRoomHumidity.value
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
      
      const shouldPowerOn = +currentRoomTemp.value <= targetTemp + 0.5
      await heater.sendCommand(mqttClient, 'POWER', shouldPowerOn ? '1' : '0')
      await sendNotification(
        `🌡️ (${heater.name}) Power ON. Current temperature: ${currentRoomTemp.value} C`
      )
      continue
    }
  }
}
