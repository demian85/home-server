# Telegram bot

## Registering a command

- Define a multi-step command in `handlers/` using the `Handler` shape from `types.ts`.
- Add its command ID to `handlers/index.ts`. In `index.ts`, register the slash command with `bot.command` and call its `message[0]` handler.
- The handler sets `ctx.session.currentCommand`. Its `id` selects the registry entry, its zero-based `step` selects an array element, and its optional `data` carries a string between steps.
- Text updates run the active step’s message handler when present. Text at a callback-only step leaves that step active.
- Button presses call `callbackQuery[step]`. With no active command or no callback at that step, the dispatcher answers "Invalid callback".
- Advance the step in the handler and clear `currentCommand` when the interaction ends. `/abort` also clears it.

## Session and access

- In `index.ts`, Telegraf session middleware loads and saves JSON under `telegraf:<key>` using the shared Redis client.
- The access middleware drops updates outside allowlisted private chats before touching Redis. Missing or malformed sessions start with `currentCommand` set to `null`. A failed session read skips that update and the next update retries Redis.
- Telegraf logs handler and session-write errors with the update ID. Subsequent updates continue.

## Temperature and system commands

- `/temperature` lists devices with a `setTemperature` function. The first callback saves the selected device ID in `data` and advances to step 1.
- A numeric selection disables automatic mode and invokes the device setter. The Automatic button enables automatic mode. Both successful paths run `automaticTemperatureHandler()` before clearing the session command.
- The setter is a runtime function. The checked-in JSONC configuration supplies no setters, so the command explains that manual settings are unavailable and closes the interaction.
- `/system` uses the same setter filter, then always reads temperature and humidity for `wemos-garage` (Outdoor sensors) and `wemos-office` (Office). Update those lookups if the device IDs change.
- The report labels readings older than five minutes as outdated and shows "(no data)" when both readings are absent. It leaves `currentCommand` at step 0, so subsequent plain text repeats the report.

## Replies and outbound notifications

- In a handler, `ctx.reply` sends to the active chat. The temperature buttons use `ctx.answerCbQuery` to acknowledge the press and `ctx.editMessageText` to replace the prompt.
- For an event outside a conversation, `sendNotification(text, parseMode?)` in `index.ts` sends to `TELEGRAM_NOTIFICATIONS_TARGET`.
- The notification helper escapes Markdown and MarkdownV2 punctuation before sending. It passes HTML and plain text through and aborts a send after 15 seconds. Failed sends return undefined. The heartbeat reads send counters and last attempt/success times through `getNotificationStatus()`.
