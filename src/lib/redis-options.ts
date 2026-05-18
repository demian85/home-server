import type { RedisClientOptions } from 'redis'

export function getRedisClientOptions(): RedisClientOptions {
  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    throw new Error('REDIS_URL is required')
  }

  const url = new URL(redisUrl)
  const database = getDatabaseNumber(url)
  const family = url.hostname.includes(':') ? 6 : 4
  const socket = {
    tls: false,
    host: url.hostname,
    port: url.port ? Number(url.port) : 6379,
    family,
    autoSelectFamily: false,
    connectTimeout: 10000,
    keepAlive: 5000,
  } as NonNullable<RedisClientOptions['socket']>

  return {
    username: url.username ? decodeURIComponent(url.username) : undefined,
    password: url.password ? decodeURIComponent(url.password) : undefined,
    database,
    socket,
  }
}

function getDatabaseNumber(url: URL) {
  if (!url.pathname || url.pathname === '/') {
    return undefined
  }

  const database = Number(url.pathname.slice(1))

  if (!Number.isInteger(database) || database < 0) {
    throw new Error(`Invalid Redis database in REDIS_URL: ${url.pathname}`)
  }

  return database
}
