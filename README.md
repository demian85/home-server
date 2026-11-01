# home-server

A smart home assistant server with the following features:

- IoT device management
  - Switch device on/off
  - Monitor device status
  - Monitor/get/set temperatures
  - Automatic temperature management
- Home assistant Telegram bot
- ?

## Setup

- Use Node.js 24 (`.nvmrc`) and npm.
- Install dependencies with `npm ci`.
- Copy `env.sample` to `.env` and set `MQTT_SERVER`, `REDIS_URL`, `TELEGRAM_BOT_TOKEN`, and `TELEGRAM_NOTIFICATIONS_TARGET`.
- Run a local Redis server if needed:

```sh
docker run --restart=always --name redis -d -p 6379:6379 redis redis-server --save 60 1 --loglevel warning
```

## Development

- `npm run dev` starts `src/index.ts` with `tsx watch` and `pino-pretty` logs.
- `npm start` runs the same entrypoint without pretty logging.
- `npm run build` compiles TypeScript and rewrites TS path aliases in `build/`.
- `npm run typecheck`, `npm run lint`, and `npm test` run focused checks.

## Home configuration

Rooms, devices, MQTT subscriptions, and heating schedules are defined in
`config.jsonc`. Comments and trailing commas are supported, and the file is
validated when the app starts.

The Docker app service mounts this file read-only. After editing it, reload the
configuration without rebuilding the image or restarting Redis:

```sh
npm run docker:restart
```

Run `npm run docker:start` after application code or dependencies change.

## Bot commands

- `help`
- `temperature`
- `system`
- `abort`

## Bot notifications

The bot sends different notifications based on the reported values/events from connected devices.

Examples:

- Abnormal voltage changes
- Water pump flow
- High temperature/humidity
