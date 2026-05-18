import { createClient } from 'redis'
import logger from './logger.js'
import { DateTime } from 'luxon'
import { getRedisClientOptions } from './redis-options.js'

interface SystemStatus {
  voltage: number | null
  powerGridVoltage: number | null
  lowVoltage: boolean
  voltageMismatch: boolean
  autoTemp: boolean
  targetTemp: number | null
}

type SystemStatusStr = Record<keyof SystemStatus, string>

export const redisClient = createClient({
  ...getRedisClientOptions(),
  socket: {
    ...getRedisClientOptions().socket,
    reconnectStrategy: () => 5000,
  },
})

redisClient.on('error', (err) => {
  if ('code' in err && ['EHOSTUNREACH', 'ECONNREFUSED'].includes(err.code)) {
    return
  }

  logger.error({ err }, 'Redis Client Error')
})

let redisConnection: Promise<unknown> | null = null

export async function connectRedis() {
  if (redisClient.isReady) {
    return
  }

  redisConnection ??= redisClient.connect().catch((err) => {
    redisConnection = null
    throw err
  })

  await redisConnection
}

export async function getDeviceStatus(deviceId: string) {
  return getDeviceKey(deviceId, 'status')
}

export async function setDeviceStatus(deviceId: string, status: string) {
  return setDeviceKey(deviceId, 'status', status)
}

export async function getDevicePower(deviceId: string) {
  return getDeviceKey(deviceId, 'power')
}

export async function setDevicePower(deviceId: string, status: string) {
  return setDeviceKey(deviceId, 'power', status)
}

export async function getSystemStatus(): Promise<SystemStatus> {
  const data = (await redisClient.hGetAll(
    `home_server:__status`
  )) as unknown as SystemStatusStr
  return {
    voltage: data.voltage ? +data.voltage : null,
    powerGridVoltage: data.powerGridVoltage ? +data.powerGridVoltage : null,
    lowVoltage: data.lowVoltage === 'true' ? true : false,
    voltageMismatch: data.voltageMismatch === 'true' ? true : false,
    autoTemp: data.autoTemp === 'true' ? true : false,
    targetTemp: data.targetTemp ? +data.targetTemp : null,
  } as SystemStatus
}

export async function setSystemStatus(
  key: keyof SystemStatus,
  value: string | number | boolean | null
) {
  await redisClient.hSet(
    `home_server:__status`,
    key,
    value === null ? '' : String(value)
  )
}

export async function setDeviceKey(
  deviceId: string,
  key: string,
  value: string | null
) {
  await redisClient.set(
    `home_server:${deviceId}:${key}`,
    JSON.stringify({ value, timestamp: DateTime.local().toMillis() })
  )
}

export async function getDeviceKey(deviceId: string, key: string) {
  const data = await redisClient.get(`home_server:${deviceId}:${key}`)
  return data
    ? (JSON.parse(data) as { value: string | null; timestamp: number })
    : null
}
