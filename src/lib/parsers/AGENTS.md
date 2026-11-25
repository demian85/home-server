# MQTT parsers

## Register a device topic

1. Add a module under `devices/` with a default export of type `Record<string, Parser>`.
   `loadParsers()` imports every direct entry under `devices/`. Keep guides, tests, and helpers outside that directory.
2. Key the map by the exact published topic, such as `tele/athom-plug-1/SENSOR`.
   Keep keys unique across modules. A later entry with the same key replaces the earlier handler.
3. Check the global and per-device `subscriptions` in `config.jsonc`.
   MQTT accepts filters such as `tele/+/SENSOR`, while `src/lib/mqtt-reporting.ts` looks up the concrete topic.
   The checked-in filters cover Tasmota SENSOR, LWT, and POWER. AUTO and Shelly button events need additional subscriptions to reach their handlers.

## Handle a payload

- `Parser` in `src/lib/types.ts` takes `unknown` and returns `Promise<void>`.
- The listener tries `JSON.parse` on trimmed payload text. Valid JSON numbers, booleans, and null arrive as those values.
  On a parse error it passes the original string, including whitespace.
- Separate messages can overlap. The listener awaits each handler independently and records its success or failure. Failure logs include the registered topic and byte count. Keep raw payloads out of logs.

## Reuse the factories in `common.ts`

| Factory | Behavior to preserve |
| --- | --- |
| `lwtParser(deviceId)` | Lowercases status and notifies on changes. A transition to offline also records power as off. |
| `powerParser(deviceId)` | Skips devices missing from config. Writes and notifies when power changes. |
| `automationEventParser(deviceId)` | Sends the event text to Telegram. |
| `temperatureSensorParser(deviceId)` | Selects the first available SI7021, AM2301, DS18B20, or SHT4X block. A jump of at least 0.5 °C within less than 65 seconds skips both readings and heating control. |
| `voltageParser()` | Handles nonzero main voltage. Sets low voltage at or below 202 V, clears it at or above 208 V, and checks for a grid difference of at least 10 V before running heating control. |

## Device-specific behavior

- `shelly-powergrid-input.ts` stores nonzero grid readings in `powerGridVoltage`. The main-voltage handler compares against this value on its next reading.
- `shelly-i3-buttons.ts` handles short presses (`S`). Input 0 selects on/off by event count and input 1 cycles bulb presets via `src/lib/shelly.ts`.
- `sonoff-water-pump.ts` infers flow from wattage after a five-second startup window. Each POWER report clears its in-memory list of previously sent flow warnings.
