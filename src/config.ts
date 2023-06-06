import { Config } from '@lib/types'

const config: Config = {
  subscriptions: ['tele/+/SENSOR', 'tele/+/LWT', 'stat/+/POWER'],
  devices: [
    {
      id: 'bulb-1',
      name: 'Light bulb 1',
      type: 'rgb',
      subscriptions: [],
      async sendCommand(mqttClient, cmd, value) {},
    },
    {
      id: 'shelly-i3',
      name: 'Button commander',
      type: 'input',
      subscriptions: [
        'shellies/shelly-i3-buttons/input_event/0',
        'shellies/shelly-i3-buttons/input_event/1',
        'shellies/shelly-i3-buttons/input_event/2',
      ],
      async sendCommand(mqttClient, cmd, value) {},
    },
    {
      id: 'wemos-living-room',
      name: 'Living Room',
      type: 'switch',
      subscriptions: [],
      url: 'http://192.168.0.141/',
      async sendCommand(mqttClient, cmd, value) {
        mqttClient.publish(`cmnd/wemos-living-room/${cmd.toUpperCase()}`, value)
      },
      async setTemperature(mqttClient, temp) {
        const nightModeTemp = Math.max(1, temp - 10)
        await this.sendCommand(
          mqttClient,
          'Rule1',
          ` on Clock#Timer=1 do Backlog Rule2 1; Rule1 0 break
            on AM2301#Temperature<${temp} do Power 1 endon
            on AM2301#Temperature>${temp + 0.5} do Power 0 endon`
        )
        await this.sendCommand(
          mqttClient,
          'Rule2',
          ` on Clock#Timer=2 do Backlog Rule1 1; Rule2 0 break
            on AM2301#Temperature<${nightModeTemp} do Power 1 endon
            on AM2301#Temperature>${nightModeTemp + 0.5} do Power 0 endon`
        )
      },
    },
    {
      id: 'mobile-heater-1',
      name: 'Mobile Heater',
      type: 'switch',
      subscriptions: [],
      url: 'http://192.168.0.86/',
      async sendCommand(mqttClient, cmd, value) {
        mqttClient.publish(`cmnd/mobile-heater-1/${cmd.toUpperCase()}`, value)
      },
      async setTemperature(mqttClient, temp) {
        const dayModeTemp = Math.max(1, temp - 5)
        await this.sendCommand(
          mqttClient,
          'Rule1',
          ` on Clock#Timer=1 do Backlog Rule2 1; Rule1 0 break
            on SI7021#Temperature<${dayModeTemp} do Power 1 endon
            on SI7021#Temperature>${dayModeTemp + 0.5} do Power 0 endon`
        )
        await this.sendCommand(
          mqttClient,
          'Rule2',
          ` on Clock#Timer=2 do Backlog Rule1 1; Rule2 0 break
            on SI7021#Temperature<${temp} do Power 1 endon
            on SI7021#Temperature>${temp + 0.5} do Power 0 endon`
        )
      },
    },
    {
      id: 'sonoff-water-pump',
      name: 'Water Pump',
      type: 'switch',
      subscriptions: [],
      url: 'http://192.168.0.118/',
      async sendCommand(mqttClient, cmd, value) {
        mqttClient.publish(`cmnd/sonoff-water-pump/${cmd.toUpperCase()}`, value)
      },
    },
  ],
}

export default config
