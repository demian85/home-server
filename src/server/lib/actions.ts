import { sendNotification } from './telegram'

let tempIsHigh = false
let humidityIsHigh = false

export function highTemperatureHandler(
  _deviceName: string,
  temp: number | null
) {
  if (temp === null) {
    return
  }

  if (temp > 30 && !tempIsHigh) {
    sendNotification(`🌡️ Temperature is HIGH (${temp} C)`)
    tempIsHigh = true
  } else {
    tempIsHigh = false
  }
}

export function highHumidityHandler(
  _deviceName: string,
  humidity: number | null
) {
  if (humidity === null) {
    return
  }

  if (humidity > 90 && !humidityIsHigh) {
    sendNotification(`🌫️ Humidity is HIGH (${humidity}%)`)
    humidityIsHigh = true
  } else {
    humidityIsHigh = false
  }
}
