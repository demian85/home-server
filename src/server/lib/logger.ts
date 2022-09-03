import logger from 'pino'

const loggerOptions = {
  name: 'home-server-v3',
  level: process.env.LOG_LEVEL || 'info',
  serializers: {
    err: logger.stdSerializers.err,
  },
  base: null,
}

export default logger(
  loggerOptions,
  process.env.NODE_ENV !== 'test'
    ? logger.destination(1)
    : logger.destination('./log')
)
