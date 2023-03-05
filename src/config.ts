import { Config } from '@lib/types'

const config: Config = {
  devices: [
    {
      name: 'bulb-1',
      type: 'rgb',
      subscriptions: [],
      powerOn() {},
      powerOff() {},
    },
    {
      name: 'shelly-i3',
      type: 'input',
      subscriptions: [
        'shellies/shelly-i3-buttons/input_event/0',
        'shellies/shelly-i3-buttons/input_event/1',
        'shellies/shelly-i3-buttons/input_event/2',
      ],
      powerOn() {},
      powerOff() {},
    },
    {
      name: 'shelly-garage',
      type: 'switch',
      subscriptions: [],
      powerOn() {},
      powerOff() {},
    },
  ],
}

export default config
