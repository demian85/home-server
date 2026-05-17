import temperatureHandlers from './temperature'
import systemHandlers from './system'
import { Handler } from '../types'

const handlers: Record<string, Handler> = {
  temperature: temperatureHandlers,
  system: systemHandlers,
}

export default handlers
