# AGENTS.md

## Repo shape
- Node 22 project (`.nvmrc`, `package.json#engines`); use npm/package-lock, not yarn/pnpm.
- Real server entrypoint is `src/index.ts`; `npm start` and `npm run dev` run it with `tsx`.
- `package.json#main` points at `build/src/index.js`; `npm run build` cleans `build/`, runs `tsc`, then `tsc-alias` so emitted `@lib/*` imports are rewritten.
- `@lib/*` is a TS path alias for `src/lib/*`; source runtime commands rely on `tsx` reading `tsconfig.json` paths.

## Commands
- Install: `npm ci` (or `npm install` when updating the lockfile). `postinstall` runs `npm run build`; use `--ignore-scripts` only when intentionally avoiding that build.
- Dev server with `tsx watch` + `pino-pretty` logs: `npm run dev`; production-like source runner: `npm start`.
- Background process scripts use pm2 and watch `src`: `npm run start:bg` / `npm run stop:bg`.
- Format tracked source: `npm run format` (only `src/**/*.{js,jsx,ts,tsx}`).
- Intended checks: `npm run lint`, `npm run typecheck`, `npm run build`, `npm test -- <jest args>`.
- ESLint uses flat config (`eslint.config.mjs`), not `.eslintrc`; Jest config is `jest.config.cjs` and ignores the helper script `src/tools/test.ts`.

## Runtime prerequisites
- `.env` is loaded only by `src/index.ts` via `import 'dotenv/config'`; standalone scripts importing libs may need to load dotenv themselves.
- Required env from code/sample: `MQTT_SERVER`, `REDIS_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_NOTIFICATIONS_TARGET`, plus optional `NODE_ENV` and `LOG_LEVEL`.
- `src/lib/ifttt.ts` also expects `IFTTT_WEBHOOK_BASE_URL` and `IFTTT_WEBHOOK_KEY` when its webhook path is exercised.
- Redis is required for device state and Telegram sessions. README's local Redis command: `docker run --restart=always --name redis -d -p 6379:6379 redis redis-server --save 60 1 --loglevel warning`.

## Architecture notes
- `src/config.ts` is the central room/device/schedule registry and contains each device's MQTT command implementation.
- MQTT subscriptions are `config.subscriptions` plus every device's `subscriptions`; message handlers are dynamically loaded from `src/lib/parsers/devices/*.ts` as default `Record<topic, Parser>` exports.
- Adding a device usually means updating both `src/config.ts` and a parser module under `src/lib/parsers/devices/`.
- Automatic temperature control is triggered from temperature and voltage parsers, persists state in Redis keys under `home_server:*`, and turns heaters off when `lowVoltage` is true.
- Temperature schedule matching in `getRoomsWithTargetTemp()` is simple inclusive/exclusive comparison (`hour >= start && hour < end`); it does not wrap ranges across midnight.
- Telegram command routing is split between `src/lib/telegram/index.ts` and `src/lib/telegram/handlers/index.ts`; keep both in sync. `/food` is registered in the bot entrypoint, but the handler map currently exports only `temperature` and `system`.

## Conventions and gotchas
- Prettier config is 2 spaces, single quotes, no semicolons, trailing commas where valid in ES5.
- `.env`, `build`, `dist`, and local `docs/mosquitto`/`docs/Tasmota rules.txt` are ignored; do not rely on ignored local docs as repo source of truth or commit secrets from them.
