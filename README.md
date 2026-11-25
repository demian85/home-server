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

- Use Node.js 22 (`.nvmrc`) and npm.
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

## When the bot goes quiet

On the Raspberry Pi, run `docker compose logs --since 1h app` from the checkout to see the events before a gap. Follow new events with `docker compose logs -f --tail=100 app`. After a rebuild, look for `Redis ready`, `MQTT subscriptions confirmed`, and `Telegram polling started`. The bot sends its startup notification after the first successful poll.

Every five minutes the app logs `Reporting status`. Compare consecutive records. Times are UTC and counters reset at process startup.

| What you see | What to check |
| --- | --- |
| MQTT is disconnected, or `subscriptionState` is `partial` or `failed` | Check broker connectivity and the filters named in the subscription error. |
| `lastMessageAt` advances but `lastHandledAt` stalls | Look for `MQTT message handler failed` and its topic. At trace level, `MQTT topic has no parser` identifies unregistered topics. |
| `redisReady` is false | Inspect the Redis service with `docker compose logs --since 1h redis`. Reports arriving during a disconnect can be missed. |
| Polling is `retrying` | Check the error code and retry delay. Network failures and Telegram rate limits retry automatically. |
| Polling is `failed` | A 401 points to bot credentials. A 409 indicates another poller or an active webhook. Resolve the conflict, then restart the app. |
| Notification `failures` rises | Look for `Failed to send Telegram notification` and its topic, duration, API code, or timeout flag. A send times out after 15 seconds. Delivery can be uncertain after a timeout, so the app does not automatically resend that message. |

For a detailed reproduction, set `LOG_LEVEL=debug` in `.env` and run `docker compose up -d --no-deps --force-recreate app` to load it. Send `/help` and compare its update ID with the handler logs. `LOG_LEVEL=trace` also records each handled MQTT topic and payload size. Restore `info` and recreate the app after collecting the logs.

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
