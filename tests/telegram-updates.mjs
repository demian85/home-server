import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { mock } from 'node:test'
import mqtt from 'mqtt'
import { Telegram } from 'telegraf'

mqtt.connect = () => new EventEmitter()
const {
  default: bot,
  sendNotification,
  getNotificationStatus,
} = await import('../src/lib/telegram/index.ts')
const { redisClient } = await import('../src/lib/db.ts')
bot.botInfo = { id: 2, username: 'home_bot', is_bot: true }

async function updates() {
  const user = { id: 1, username: 'demian85', type: 'private' }
  let updateId = 0
  const help = (chat = user) =>
    bot.handleUpdate({
      update_id: ++updateId,
      message: {
        text: '/help',
        entities: [{ type: 'bot_command', offset: 0, length: 5 }],
        from: user,
        chat,
      },
    })

  let stored = 'invalid-private-fixture'
  let reads = 0
  redisClient.get = async () => {
    if (++reads === 1) throw new Error('private-fixture-read')
    return stored
  }
  redisClient.set = async (_key, value) => {
    stored = value
  }
  const replies = []
  Telegram.prototype.callApi = async (method, payload) => {
    assert.equal(method, 'sendMessage')
    replies.push(payload.text)
    if (replies.length === 1) throw new Error('private-fixture-reply')
  }

  await help({ ...user, username: 'private-fixture-outsider' })
  await help({ ...user, type: 'group' })
  assert.equal(reads, 0)
  await help()
  assert.equal(reads, 1)
  assert.deepEqual(replies, [])
  assert.equal(stored, 'invalid-private-fixture')

  await help()
  await help()
  assert.deepEqual(replies, ['What do you need?', 'What do you need?'])
  assert.deepEqual(JSON.parse(stored), { currentCommand: null })

  const session = { currentCommand: { id: 'temperature', step: 1 } }
  stored = JSON.stringify(session)
  await bot.handleUpdate({
    update_id: ++updateId,
    message: { text: 'private-fixture-text', from: user, chat: user },
  })
  assert.deepEqual(JSON.parse(stored), session)

  await bot.handleUpdate({
    update_id: ++updateId,
    message: {
      text: '/temperature',
      entities: [{ type: 'bot_command', offset: 0, length: 12 }],
      from: user,
      chat: user,
    },
  })
  assert.equal(JSON.parse(stored).currentCommand, null)
  assert.match(replies.at(-1), /no devices/i)
}

async function notifications() {
  mock.timers.enable({ apis: ['setTimeout'] })
  try {
    bot.telegram.callApi = (_method, _payload, { signal }) =>
      new Promise((_resolve, reject) =>
        signal.addEventListener('abort', () =>
          reject(new Error('private-fixture-timeout'))
        )
      )
    const pending = sendNotification('private-fixture-notification')
    assert.equal(getNotificationStatus().inFlight, 1)
    mock.timers.tick(15_000)
    assert.equal(await pending, undefined)
    assert.equal(getNotificationStatus().failures, 1)
    assert.equal(getNotificationStatus().inFlight, 0)
    assert.equal(getNotificationStatus().lastSuccessAt, null)

    const receipt = { message_id: 7 }
    bot.telegram.callApi = async (method, payload) => {
      assert.equal(method, 'sendMessage')
      assert.equal(payload.text, 'private\\-fixture\\!')
      assert.equal(payload.chat_id, 'private-fixture-target')
      assert.equal(payload.parse_mode, 'MarkdownV2')
      return receipt
    }
    assert.deepEqual(
      await sendNotification('private-fixture!', 'MarkdownV2'),
      receipt
    )
    assert.ok(
      Number.isFinite(Date.parse(getNotificationStatus().lastSuccessAt))
    )
    assert.ok(
      Number.isFinite(Date.parse(getNotificationStatus().lastAttemptAt))
    )
  } finally {
    mock.timers.reset()
  }
}

if (process.argv[2] === 'updates') await updates()
else await notifications()
