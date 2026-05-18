import temperatureHandlers from './temperature.js'
import systemHandlers from './system.js'
import { Handler } from '../types.js'

const handlers: Record<string, Handler> = {
  temperature: temperatureHandlers,
  system: systemHandlers,
}

export default handlers
