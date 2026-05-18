import { pino, LoggerOptions } from 'pino'
import pretty from 'pino-pretty'

const loggerOptions: LoggerOptions = {
  name: 'home-server',
  level: process.env.LOG_LEVEL || 'info',
  serializers: {
    err: pino.stdSerializers.err,
  },
  base: null,
}

export default process.env.NODE_ENV === 'test'
  ? pino(loggerOptions, pino.destination('./log'))
  : process.env.LOG_PRETTY === 'true' && process.env.NODE_ENV !== 'test'
    ? pino(loggerOptions, pretty())
    : pino(loggerOptions)
