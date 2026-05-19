import { pino, LoggerOptions, DestinationStream } from 'pino'

const loggerOptions: LoggerOptions = {
  name: 'home-server',
  level: process.env.LOG_LEVEL || 'info',
  serializers: {
    err: pino.stdSerializers.err,
  },
  base: null,
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
