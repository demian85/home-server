# sonoff-server
A basic custom server implementation for managing appliances at home using [Sonoff](http://sonoff.itead.cc/en/) devices.

## Motivation
I bought a bunch of Sonoff devices and decided to upgrade their firmware to [Sonoff-Tasmota](https://github.com/arendst/Sonoff-Tasmota).

Replacing the stock firmware allows me to have complete control over the device.
Sonoff-Tasmota uses MQTT as the underlying protocol for communication between a broker and the device.

After using [MQTT Dash](https://play.google.com/store/apps/details?id=net.routix.mqttdash&hl=en) for some time, I decided to build a Progressive Web App.

## Setup
Server runs on a local Raspberry PI model 3 B+ which has the following services:
- Mosquitto MQTT Broker
- Redis server

I currently own 3 Sonoff devices, which are connected to the following appliances:
- Patio lamp
- Room lamp
- Room heater (this one also reports values from its SI7021 temperature and humidity sensor).

## How it works
Sonoff devices connect to the MQTT broker and report their state while also subscribing to a control topic, allowing you to switch them on/off.

Server runs in the background and subscribes to the sensor topic for the Sonoff TH16. Some logic decides when to switch the heater on/off.

The UI is built on React and consists of simple components that allow the user to switch the appliances on/off and view sensor, weather and derived data, like the "real feel" temperature.

The browser keeps a connection to the MQTT broker over Websocket.

## What's next?
Not sure, but I recently started playing with electronics and found home-automation to be my new hobby.

I'll keep experimenting with dev boards like Arduino and Sonoff devices. They are low cost devices that allows easy customization.

