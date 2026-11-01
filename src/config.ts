import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Config, RoomWithTargetTemp } from '@lib/types.js'
import { parse, printParseErrorCode, type ParseError } from 'jsonc-parser'
import { DateTime } from 'luxon'
import { z } from 'zod'

const hourSchema = z.number().int().min(0).max(23)
const weekDaySchema = z.number().int().min(1).max(7)
const temperatureRangeSchema = z.strictObject({
  temp: z.number(),
  weekDays: z.tuple([weekDaySchema, weekDaySchema]),
  hours: z.tuple([hourSchema, hourSchema]),
})
const roomSchema = z.strictObject({
  id: z.string().min(1),
  name: z.string().min(1),
  temperatures: z.array(temperatureRangeSchema).optional(),
})
const deviceSchema = z.strictObject({
  id: z.string().min(1),
  room: z.string().min(1),
  name: z.string().min(1),
  types: z.array(z.enum(['rgb', 'switch', 'sensor'])).min(1),
  subtype: z.enum(['heater', 'light']).optional(),
  subscriptions: z.array(z.string().min(1)),
  url: z.url().optional(),
})
const configSchema: z.ZodType<Config> = z.strictObject({
  subscriptions: z.array(z.string().min(1)),
  rooms: z.array(roomSchema),
  devices: z.array(deviceSchema),
})

class ConfigSyntaxError extends Error {
  constructor(path: string, error: ParseError) {
    super(
      `Invalid JSONC in ${path} at offset ${error.offset}: ${printParseErrorCode(error.error)}`
    )
    this.name = 'ConfigSyntaxError'
  }
}

const configPath = resolve(process.cwd(), 'config.jsonc')
const parseErrors: ParseError[] = []
const rawConfig: unknown = parse(
  readFileSync(configPath, 'utf8'),
  parseErrors,
  {
    allowTrailingComma: true,
  }
)
const firstParseError = parseErrors[0]

if (firstParseError) {
  throw new ConfigSyntaxError(configPath, firstParseError)
}

const config = configSchema.parse(rawConfig)

export function getDevice(id?: string) {
  return config.devices.find((d) => d.id === id)
}

export function getRoom(id?: string) {
  return config.rooms.find((d) => d.id === id)
}

export function getHeatingDevice(roomId?: string) {
  return config.devices.find(
    (d) =>
      d.room === roomId && d.types.includes('switch') && d.subtype === 'heater'
  )
}

export function getSensorDevice(roomId?: string) {
  return config.devices.find(
    (d) => d.room === roomId && d.types.includes('sensor')
  )
}

export function getRoomsWithTargetTemp(): RoomWithTargetTemp[] {
  const today = DateTime.local()
  const hour = today.hour
  const weekDay = today.weekday
  const rooms: RoomWithTargetTemp[] = []

  config.rooms.reduce((prev, curr) => {
    const targetTemp = curr.temperatures?.find((item) => {
      const [startHour, endHour] = item.hours
      const [startDay, endDay] = item.weekDays

      const matchesHour =
        startHour < endHour
          ? hour >= startHour && hour < endHour
          : hour >= startHour || hour < endHour

      const matchesDay =
        startDay < endDay
          ? weekDay >= startDay && weekDay <= endDay
          : weekDay >= startDay || weekDay <= endDay

      return matchesHour && matchesDay
    })
    prev.push({ id: curr.id, temp: targetTemp ? targetTemp.temp : null })
    return prev
  }, rooms)

  return rooms
}

export default config
