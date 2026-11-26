import { pino, LoggerOptions, DestinationStream } from 'pino'
import { AsyncLocalStorage } from 'node:async_hooks'

type LogContext = { topic: string } | { updateId: number }
const context = new AsyncLocalStorage<LogContext>()

export function withLogContext<T>(fields: LogContext, run: () => T): T {
  return context.run(fields, run)
}

const loggerOptions: LoggerOptions = {
  name: 'home-server',
  level: process.env.LOG_LEVEL || 'info',
  serializers: {
    err: pino.stdSerializers.err,
  },
  base: null,
  mixin: () => ({ ...context.getStore() }),
}

async function getDestination(): Promise<DestinationStream | undefined> {
  if (process.env.NODE_ENV === 'test') {
    return pino.destination('./log')
  }
  if (process.env.LOG_PRETTY === 'true') {
    try {
      const { default: pretty } = await import('pino-pretty')
      return pretty()
    } catch {
      return undefined
    }
  }
  return undefined
}

const destination = await getDestination()
export default pino(loggerOptions, destination)
