import logger, { LoggerOptions } from 'pino'

const loggerOptions: LoggerOptions = {
  name: 'home-server',
  level: process.env.LOG_LEVEL || 'info',
  serializers: {
    err: logger.stdSerializers.err,
  },
  base: null,
}

if (process.env.LOG_PRETTY === 'true' && process.env.NODE_ENV !== 'test') {
  loggerOptions.transport = {
    target: 'pino-pretty',
  }
}

export default process.env.NODE_ENV === 'test'
  ? logger(loggerOptions, logger.destination('./log'))
  : logger(loggerOptions)
