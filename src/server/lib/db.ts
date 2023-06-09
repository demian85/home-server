import { createClient } from 'redis'
import logger from './logger'
import { DateTime } from 'luxon'

interface SystemStatus {
  lowVoltage: string
  voltage: string
}

export const redisClient = createClient({ url: process.env.REDIS_URL })
redisClient.on('error', (err) => logger.error({ err }, 'Redis Client Error'))
redisClient.connect()

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
  )) as unknown as SystemStatus
  return data
}

export async function setSystemStatus(
  key: keyof SystemStatus,
  value: string | number | boolean
) {
  await redisClient.hSet(`home_server:__status`, key, String(value))
}

async function setDeviceKey(deviceId: string, key: string, value: string) {
  await redisClient.set(
    `home_server:${deviceId}:${key}`,
    JSON.stringify({ value, timestamp: DateTime.local().toMillis() })
  )
}

async function getDeviceKey(deviceId: string, key: string) {
  const data = await redisClient.get(`home_server:${deviceId}:${key}`)
  return data
    ? (JSON.parse(data) as { value: string; timestamp: number })
    : null
}
