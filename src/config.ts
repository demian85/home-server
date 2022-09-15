export default {
  devices: [
    {
      name: 'bulb-1',
      type: 'rgb',
      eventTopics: [],
      powerOn() {},
      powerOff() {},
    },
    {
      name: 'shelly-i3',
      type: 'input',
      eventTopics: [
        'shellies/shelly-i3-buttons/input_event/0',
        'shellies/shelly-i3-buttons/input_event/1',
        'shellies/shelly-i3-buttons/input_event/2',
      ],
      powerOn() {},
      powerOff() {},
    },
  ],
}
