import mqtt from 'mqtt'

export const client = mqtt.connect(process.env.MQTT_SERVER!, { clean: true })
