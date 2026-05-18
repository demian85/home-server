import logger, { LoggerOptions } from 'pino'
import pretty from 'pino-pretty'

const loggerOptions: LoggerOptions = {
  name: 'home-server',
  level: process.env.LOG_LEVEL || 'info',
  serializers: {
    err: logger.stdSerializers.err,
  },
  base: null,
}

export default process.env.NODE_ENV === 'test'
  ? logger(loggerOptions, logger.destination('./log'))
  : process.env.LOG_PRETTY === 'true' && process.env.NODE_ENV !== 'test'
    ? logger(loggerOptions, pretty())
    : logger(loggerOptions)
