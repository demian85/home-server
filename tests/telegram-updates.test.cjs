const { execFileSync } = require('node:child_process')

function run(scenario) {
  const stdout = execFileSync(
    process.execPath,
    ['--import', 'tsx', 'tests/telegram-updates.mjs', scenario],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        LOG_LEVEL: 'debug',
        LOG_PRETTY: 'false',
        REDIS_URL: 'redis://localhost',
        MQTT_SERVER: 'mqtt://localhost',
        TELEGRAM_BOT_TOKEN: 'private-fixture-token',
        TELEGRAM_NOTIFICATIONS_TARGET: 'private-fixture-target',
      },
      timeout: 10_000,
    }
  )
  expect(stdout).not.toContain('private-fixture')
  return stdout
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line))
}

test('authorized updates recover from Redis and handler errors and retain callback-only steps', () => {
  const records = run('updates')
  expect(records).toContainEqual(
    expect.objectContaining({ command: 'help', step: 0, updateId: 5 })
  )
  expect(records).toContainEqual(
    expect.objectContaining({ updateType: 'message', updateId: 1 })
  )
  const errors = records.filter((record) => record.level === 50)
  expect(errors.map((record) => record.msg)).toEqual([
    'Telegram session read failed',
    'Telegram update failed',
  ])
  expect(errors[1].updateId).toBe(4)
})

test('stalled notifications abort with safe diagnostics and subsequent sends succeed', () => {
  const errors = run('notifications').filter((record) => record.level === 50)
  expect(errors).toHaveLength(1)
  expect(errors[0].timedOut).toBe(true)
})
