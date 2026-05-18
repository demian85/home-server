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
  const { autoTemp, lowVoltage } = await getSystemStatus()

  logger.debug({ autoTemp, lowVoltage }, `automaticTemperatureHandler()`)

  if (!autoTemp) {
    return
  }

  const outsideTemp = await getDeviceKey('laundry-sensors', 'temperature')

  // Find target temp per room
  const roomsWithHeatingDevices = getRoomsWithTargetTemp()

  logger.debug({ roomsWithHeatingDevices }, 'Rooms with target temperature set')

  for (const room of roomsWithHeatingDevices) {
    logger.debug({ room }, `Processing room...`)

    let targetTemp = room.temp

    const heater = getHeatingDevice(room.id)
    const sensorDevice = getSensorDevice(room.id)

    if (!heater || !sensorDevice) {
      logger.debug(
        {
          heater,
          sensorDevice,
        },
        `Room ${room.id} has no heating or sensor devices`
      )
      continue
    }

    const currentRoomTemp = await getDeviceKey(sensorDevice.id, 'temperature')
    const currentRoomHumidity = await getDeviceKey(sensorDevice.id, 'humidity')

    logger.debug(
      {
        currentRoomTemp,
        currentRoomHumidity,
      },
      `Room ${room.id} sensor values`
    )

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

      const tempValue = +currentRoomTemp.value
      if (tempValue < targetTemp) {
        await sendCommand(heater.id, 'POWER', '1')
      } else if (tempValue > targetTemp + 0.5) {
        await sendCommand(heater.id, 'POWER', '0')
      }
    }
  }
}

export async function sendCommand(
  deviceId: string,
  cmd: string,
  value: string
) {
  logger.debug({ deviceId, cmd, value }, 'Sending command...')
  mqttClient.publish(`cmnd/${deviceId}/${cmd.toUpperCase()}`, value)
}
