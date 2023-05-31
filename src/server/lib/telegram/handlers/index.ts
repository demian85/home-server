import temperatureHandlers from './temperature'
import foodHandlers from './food'
import { Handler } from '../types'

const handlers: Record<string, Handler> = {
  temperature: temperatureHandlers,
  food: foodHandlers,
}

export default handlers
