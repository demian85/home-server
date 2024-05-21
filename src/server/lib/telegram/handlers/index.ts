import temperatureHandlers from './temperature'
import foodHandlers from './food'
import systemHandlers from './system'
import { Handler } from '../types'

const handlers: Record<string, Handler> = {
  temperature: temperatureHandlers,
  food: foodHandlers,
  system: systemHandlers,
}

export default handlers
