# Home server

Node 22 ESM service for MQTT device telemetry, Redis-backed heating control, and a Telegram home assistant.
Source snapshot reviewed on 2026-11-25 at `master` commit `925f31d`.

## Where to look

| Change | Start here |
| --- | --- |
| Rooms, devices, subscriptions, heating schedules | `config.jsonc` |
| Configuration validation and room/device selection | `src/config.ts` and `src/lib/types.ts` |
| MQTT payloads and per-device behavior | [Parser guide](src/lib/parsers/AGENTS.md) |
| Bot commands, sessions, and notifications | [Telegram guide](src/lib/telegram/AGENTS.md) |
| Service startup and subscription wiring | `src/index.ts` |
| Container startup, Redis storage, and config mount | `Dockerfile` and `docker-compose.yml` |

## Git workflow

- Check `git status --short --branch`. For new work, fetch `origin/master` and branch from it unless the task has a different base. Use `<type>/<short-kebab-case-topic>` with `feat`, `fix`, `chore`, `docs`, `refactor`, or `test`.
- Continue related changes on their task branch. If the checkout contains unrelated work, use a separate worktree and preserve the pending edits.
- Verify the change, stage only its files, and commit independent changes separately. Documentation-only changes need no version or changelog update.
- Push completed task commits to the same branch name on `origin` and set the upstream on the first push. Honor explicit requests to keep work local.
- Inspect `origin/<base>...HEAD`. After the first push, open a draft PR with an explicit base, or reuse the existing PR for that head and base. Verify the remote commit, PR base, head, and draft status.
- Link applicable issues and describe the checks performed. Direct commits or pushes to shared branches, merges, deployments, and rewrites of published history require an explicit request.

## Runtime and commands

- Use Node 22 from `.nvmrc` and npm with `package-lock.json`. The package engine and Docker image both select 22.
- Run from the repository root. The configuration loader resolves `config.jsonc` against the working directory at module load.
- Copy `env.sample` to `.env` and set `MQTT_SERVER`, `REDIS_URL`, `TELEGRAM_BOT_TOKEN`, and `TELEGRAM_NOTIFICATIONS_TARGET`.
- Only `src/index.ts` imports `dotenv/config`. Set the environment before importing runtime modules in standalone scripts.
- `LOG_LEVEL` controls Pino verbosity. The optional IFTTT path uses `IFTTT_WEBHOOK_BASE_URL` and `IFTTT_WEBHOOK_KEY`.
- Keep credentials and ignored local broker and Tasmota notes out of repository documentation.

| Command | Behavior |
| --- | --- |
| `npm ci` | Installs locked dependencies and runs the build via `postinstall`. Use `npm install` for lockfile updates. |
| `npm run dev` / `npm start` | Run `src/index.ts` with `tsx`. Dev enables watch mode and pretty logs. |
| `npm run build` | Cleans `build/`, runs `tsc`, then rewrites aliases with `tsc-alias`. Package main is `build/src/index.js`. |
| `npm run lint` / `npm run typecheck` | Run the flat ESLint config and TypeScript's no-emit check. |
| `npm test -- <jest args>` | Runs Jest with `--passWithNoTests`. Jest excludes the standalone heat-index example in `src/tools/test.ts`. |
| `npm run format` | Formats JS and TS source under `src/`, including JSX and TSX. |
| `npm run docker:start` | Builds and starts the app and Redis with Compose. Use after code or dependency changes. |
| `npm run docker:restart` | Restarts the app to reread the bind-mounted `config.jsonc`. |

For a standalone Redis instance, the README uses `docker run --restart=always --name redis -d -p 6379:6379 redis redis-server --save 60 1 --loglevel warning`.
TypeScript source imports use ESM `.js` specifiers. `@lib/*` maps to `src/lib/*` for `tsx` and is rewritten in the build.
Prettier uses two spaces, single quotes, ES5 trailing commas, and no semicolons.

## Configuration and heating

- Edit the inventory in `config.jsonc`. Comments and trailing commas are accepted. Adding a field also requires updating the strict Zod schema in `src/config.ts` and its type in `src/lib/types.ts`.
- `getRoomsWithTargetTemp()` uses the first matching range for each room. Hours use local time, start inclusive and end exclusive. ISO weekday endpoints are both inclusive.
- Both ranges wrap when the start exceeds the end. Equal endpoints match every hour or every weekday respectively. After midnight the weekday check uses the current local day.
- Device order matters. `getHeatingDevice()` selects the first switch with subtype `heater` in a room. `getSensorDevice()` selects the first device with type `sensor` in that room.

## Code map

Call sites below come from the source. Project-wide reference counts were unavailable.

| Symbol | Location | Role and call sites |
| --- | --- | --- |
| `connectRedis` | `src/lib/db.ts` | Startup awaits the connection before loading parsers and launching Telegram. |
| `loadParsers` | `src/lib/parsers/index.ts` | Builds the topic map used by the MQTT message listener in `src/index.ts`. |
| `getDeviceKey` / `setDeviceKey` | `src/lib/db.ts` | Read and write timestamped JSON at `home_server:<deviceId>:<key>`. A missing key reads as null. |
| `getSystemStatus` / `setSystemStatus` | `src/lib/db.ts` | Translate fields in the `home_server:__status` hash. Automatic mode defaults on when its field is absent. |
| `automaticTemperatureHandler` | `src/lib/actions.ts` | Runs from temperature and main-voltage parsers and the Telegram temperature flow. |
| `sendCommand` | `src/lib/actions.ts` | Publishes heater commands to `cmnd/<deviceId>/<UPPERCASE_COMMAND>`. |

Automatic control skips rooms without a heater, sensor, or usable temperature reading. With automatic mode enabled, low voltage or a missing target sends an off command for eligible rooms.
Otherwise it turns heat on below the adjusted target and off above target plus 0.5 °C. Read the humidity and outdoor-temperature adjustments in `actions.ts` before changing those boundaries.
