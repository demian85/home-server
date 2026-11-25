let bot, notify, polling, controller, TelegramError

function waitForAbort({ signal }) {
  const error = Object.assign(new Error('fixture timeout'), {
    name: 'AbortError',
  })
  return new Promise((_, reject) => {
    if (signal.aborted) reject(error)
    else signal.addEventListener('abort', () => reject(error), { once: true })
  })
}

beforeEach(() => {
  jest.resetModules()
  jest.useFakeTimers()
  const sdk = require('telegraf')
  TelegramError = sdk.TelegramError
  bot = new sdk.Telegraf('fixture')
  notify = jest.fn().mockResolvedValue(undefined)
  controller = new AbortController()
  jest.doMock(
    '../src/lib/telegram/index.js',
    () => ({ __esModule: true, default: bot, sendNotification: notify }),
    { virtual: true }
  )
  jest.doMock('@lib/log-error.js', () => require('../src/lib/log-error.ts'), {
    virtual: true,
  })
  jest.doMock('@lib/logger.js', () => ({ info: jest.fn(), warn: jest.fn() }), {
    virtual: true,
  })
  polling = require('../src/lib/telegram/polling.ts')
})
afterEach(() => {
  controller.abort()
  jest.useRealTimers()
  jest.restoreAllMocks()
})

test.each(['getMe', 'deleteWebhook', 'getUpdates'])(
  'shutdown during the first %s request cancels without sending a startup alert',
  async (pending) => {
    bot.telegram.callApi = jest.fn((method, _, options) =>
      method === pending ? waitForAbort(options) : Promise.resolve(true)
    )
    const lifetime = polling.runTelegramPolling(controller.signal)
    await jest.advanceTimersByTimeAsync(0)
    expect(bot.telegram.callApi.mock.lastCall[0]).toBe(pending)
    controller.abort()
    await lifetime
    expect(notify).not.toHaveBeenCalled()
    expect(polling.getTelegramPollingStatus()).toEqual({
      state: 'stopped',
      lastSuccessfulPollAt: null,
    })
  }
)

test('a hung long poll is cancelled and retried, preserving the offset and a single startup report', async () => {
  const update = { update_id: 11, message: { text: 'test' } }
  const resumed = Promise.withResolvers()
  let polls = 0
  const handled = jest.fn()
  bot.use((ctx) => handled(ctx.update.update_id))
  bot.telegram.callApi = jest.fn(async (method, _, options) => {
    if (method !== 'getUpdates') return true
    polls++
    if (polls === 1) return [update]
    if (polls === 3) return []
    if (polls === 4) resumed.resolve()
    return waitForAbort(options)
  })
  const lifetime = polling.runTelegramPolling(controller.signal)
  await jest.advanceTimersByTimeAsync(0)
  expect(handled).toHaveBeenCalledWith(11)
  expect(notify).toHaveBeenCalledWith('Server initialized')
  const firstHealthy = polling.getTelegramPollingStatus().lastSuccessfulPollAt
  expect(firstHealthy).toEqual(expect.any(String))
  await jest.advanceTimersByTimeAsync(65_000)
  expect(polling.getTelegramPollingStatus()).toEqual({
    state: 'retrying',
    lastSuccessfulPollAt: firstHealthy,
  })
  await resumed.promise
  expect(polling.getTelegramPollingStatus().state).toBe('polling')
  expect(polling.getTelegramPollingStatus().lastSuccessfulPollAt).not.toBe(
    firstHealthy
  )
  expect(notify).toHaveBeenCalledTimes(1)
  const offsets = bot.telegram.callApi.mock.calls
    .filter(([method]) => method === 'getUpdates')
    .map(([, params]) => params.offset)
  expect(offsets).toEqual([0, 12, 12, 12])
  controller.abort()
  await lifetime
})

test('shutdown waits for the in-flight update before confirming its offset', async () => {
  let finishHandler
  const handled = new Promise((resolve) => {
    finishHandler = resolve
  })
  bot.use(() => handled)
  const reads = []
  bot.telegram.callApi = jest.fn(async (method, params) => {
    if (method !== 'getUpdates') return true
    reads.push(params.offset)
    return [{ update_id: 28 }]
  })
  const lifetime = polling.runTelegramPolling(controller.signal)
  await jest.advanceTimersByTimeAsync(0)
  controller.abort()
  expect(reads).toEqual([0])
  finishHandler()
  await lifetime
  expect(reads).toEqual([0, 29])
})

test('rate limit backoff honors Telegram retry_after and can be cancelled', async () => {
  const delay = jest.spyOn(require('node:timers/promises'), 'setTimeout')
  const limited = new TelegramError({
    error_code: 429,
    description: 'limited',
    parameters: { retry_after: 90 },
  })
  bot.telegram.callApi = jest.fn().mockRejectedValue(limited)
  const lifetime = polling.runTelegramPolling(controller.signal)
  await jest.advanceTimersByTimeAsync(0)
  expect(polling.getTelegramPollingStatus().state).toBe('retrying')
  expect(delay).toHaveBeenCalledWith(90_000, undefined, {
    signal: controller.signal,
  })
  expect(bot.telegram.callApi).toHaveBeenCalledTimes(1)
  controller.abort()
  await lifetime
  expect(polling.getTelegramPollingStatus().state).toBe('stopped')
})

test.each([401, 409])(
  'Telegram %i stops polling with a visible failure and no false readiness',
  async (code) => {
    const error = new TelegramError({
      error_code: code,
      description: 'fixture failure',
    })
    bot.telegram.callApi = jest.fn(async (method) => {
      if (method === 'getUpdates') throw error
      return true
    })
    await expect(polling.runTelegramPolling(controller.signal)).rejects.toBe(
      error
    )
    expect(polling.getTelegramPollingStatus()).toEqual({
      state: 'failed',
      lastSuccessfulPollAt: null,
    })
    expect(notify).not.toHaveBeenCalled()
  }
)
