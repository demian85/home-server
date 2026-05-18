import {
  getHeatingDevice,
  getRoomsWithTargetTemp,
  getSensorDevice,
} from '../config.js'
import { getDeviceKey, getSystemStatus } from './db.js'
import logger from './logger.js'
import { client as mqttClient } from '@lib/mqtt.js'
import { DateTime } from 'luxon'

export async function automaticTemperatureHandler() {
  logger.debug(`automaticTemperatureHandler()`)

  const { autoTemp, lowVoltage } = await getSystemStatus()

  if (!autoTemp) {
    return
  }

  const outsideTemp = await getDeviceKey('laundry-sensors', 'temperature')

  // Find target temp per room
  const roomsWithHeatingDevices = getRoomsWithTargetTemp()

  logger.debug({ roomsWithHeatingDevices }, 'Rooms with target temperature set')

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
      await sendCommand(heater.id, 'POWER', '0')
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
      await sendCommand(heater.id, 'POWER', shouldPowerOn ? '1' : '0')
      // const currStatus = await getDevicePower(heater.id)
      // if (
      //   !currStatus ||
      //   (shouldPowerOn && currStatus.value === 'off') ||
      //   (!shouldPowerOn && currStatus.value === 'on')
      // ) {
      //   await sendNotification(
      //     `(${heater.name}) Power ${shouldPowerOn ? 'ON' : 'OFF'}. Current temperature: ${currentRoomTemp.value} C`
      //   )
      // }
    }
  }
}

export async function sendCommand(
  deviceId: string,
  cmd: string,
  value: string
) {
  mqttClient.publish(`cmnd/${deviceId}/${cmd.toUpperCase()}`, value)
}
