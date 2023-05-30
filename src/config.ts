import { Config } from '@lib/types'
import { MqttClient } from 'mqtt'

const config: Config = {
  subscriptions: ['tele/+/SENSOR', 'tele/+/LWT'],
  devices: [
    {
      id: 'bulb-1',
      name: 'Light bulb 1',
      type: 'rgb',
      subscriptions: [],
      async sendCommand(mqttClient: MqttClient, cmd, value) {},
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
      async sendCommand(mqttClient: MqttClient, cmd, value) {},
    },
    {
      id: 'wemos-living-room',
      name: 'Living Room',
      type: 'switch',
      subscriptions: [],
      async sendCommand(mqttClient: MqttClient, cmd, value) {
        mqttClient.publish(`cmnd/wemos-living-room/${cmd.toUpperCase()}`, value)
      },
      async setTemperature(mqttClient: MqttClient, temp: number) {
        await this.sendCommand(
          mqttClient,
          'Rule1',
          ` on Clock#Timer=1 do Backlog Rule2 1; Rule1 0 break
            on AM2301#Temperature<${temp} do Power 1 endon
            on AM2301#Temperature>${temp + 0.5} do Power 0 endon`
        )
      },
    },
  ],
}

export default config
