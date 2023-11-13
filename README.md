# home-server

A smart home assistant server with the following features:

- IoT device management
  - Switch device on/off
  - Monitor device status
  - Monitor/get/set temperatures
- Home assistant Telegram bot
- Food stock tracking using OpenAI API
- ?

## Bot commands

- `help`
- `temperature`
- `food`

## Bot notifications

The bot sends different notifications based on the reported values/events from connected devices.

Examples:

- Abnormal voltage changes
- Water pump flow
- High temperature/humidity

## Redis server

`docker run --restart=always --name redis -d -p 6379:6379 redis redis-server --save 60 1 --loglevel warning`
