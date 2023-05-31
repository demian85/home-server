import { sendNotification } from './telegram'

let voltageIsLow: boolean | null = null
let tempIsHigh = false

export function voltageHandler(voltage: number) {
  if (voltage === 0) {
    return
  }

  if (voltage <= 205 && (voltageIsLow === false || voltageIsLow === null)) {
    sendNotification(`*Energy Watcher* reported: Voltage is LOW: ${voltage}v`)
    voltageIsLow = true
  } else if (
    voltage >= 212 &&
    (voltageIsLow === true || voltageIsLow === null)
  ) {
    sendNotification(
      `⚡ *Energy Watcher* reported: Voltage is NORMAL: ${voltage}v`
    )
    voltageIsLow = false
  }
}

export function highTemperatureHandler(
  deviceName: string,
  temp: number | null
) {
  if (temp === null) {
    return
  }

  if (temp > 30 && !tempIsHigh) {
    sendNotification(
      `🌡️ *Temperature Watcher* reported: Temperature is HIGH: ${temp} C`
    )
    tempIsHigh = true
  } else {
    tempIsHigh = false
  }
}

export function lwtHandler(deviceName: string, payload: unknown) {
  const online = String(payload).toLowerCase() === 'online'
  sendNotification(`${deviceName} is ${online ? 'online 🟢' : 'offline 🔴'}`)
}
