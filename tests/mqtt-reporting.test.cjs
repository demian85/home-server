const { EventEmitter } = require('node:events')

const topics = ['tele/+/SENSOR', 'stat/+/POWER']
let client
let log
let reporting

beforeEach(() => {
  jest.resetModules()
  client = Object.assign(new EventEmitter(), {
    connected: true,
    subscribe: jest.fn(),
  })
  log = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), trace: jest.fn() }
  jest.doMock('mqtt', () => ({ connect: () => client }))
  jest.doMock(
    '@lib/logger.js',
    () => ({
      __esModule: true,
      default: log,
      withLogContext: (_, callback) => callback(),
    }),
    { virtual: true }
  )
  jest.doMock('@lib/log-error.js', () => require('../src/lib/log-error.ts'), {
    virtual: true,
  })
  jest.doMock('@lib/mqtt.js', () => require('../src/lib/mqtt.ts'), {
    virtual: true,
  })
  jest.doMock(
    '../src/config.js',
    () => ({
      subscriptions: [topics[0]],
      devices: [{ subscriptions: topics }],
    }),
    { virtual: true }
  )
  reporting = require('../src/lib/mqtt-reporting.ts')
})

test('a rejected handler leaves overlapping reports independent and logs no payload', async () => {
  const topic = 'tele/heater/SENSOR'
  let rejectFirst
  const handle = jest
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectFirst = reject
        })
    )
    .mockResolvedValue(undefined)
  reporting.startMqttReporting({ [topic]: handle })
  client.emit(
    'message',
    topic,
    Buffer.from('{"password":"synthetic-private-payload"}')
  )
  client.emit('message', topic, Buffer.from('  ON  '))
  client.emit('message', 'constructor', Buffer.from('unknown'))
  await new Promise(setImmediate)
  expect(handle.mock.calls).toEqual([
    [{ password: 'synthetic-private-payload' }],
    ['  ON  '],
  ])
  expect(reporting.getMqttReportingStatus()).toMatchObject({
    subscriptionState: 'pending',
    lastSubscriptionAttemptAt: expect.any(String),
    messagesReceived: 3,
    messagesHandled: 1,
    parserFailures: 0,
    lastMessageAt: expect.any(String),
    lastHandledAt: expect.any(String),
  })
  rejectFirst(new Error('synthetic-private-payload'))
  await new Promise(setImmediate)
  expect(reporting.getMqttReportingStatus().parserFailures).toBe(1)
  expect(log.error).toHaveBeenCalledWith(
    expect.objectContaining({ topic, payloadBytes: 40 }),
    expect.any(String)
  )
  expect(
    JSON.stringify([log.trace.mock.calls, log.error.mock.calls])
  ).not.toContain('synthetic-private-payload')
})

test('subscriptions distinguish failures and partial denials from confirmation on reconnect', () => {
  client.subscribe
    .mockImplementationOnce((_, done) =>
      done(new Error('synthetic-private-payload'))
    )
    .mockImplementationOnce((_, done) =>
      done(
        null,
        topics.map((topic, i) => ({ topic, qos: i ? 128 : 0 }))
      )
    )
    .mockImplementationOnce((_, done) =>
      done(
        null,
        topics.map((topic) => ({ topic, qos: 0 }))
      )
    )
  reporting.startMqttReporting({})
  expect(reporting.getMqttReportingStatus().subscriptionState).toBe('failed')
  expect(log.info).not.toHaveBeenCalled()
  client.emit('connect')
  expect(reporting.getMqttReportingStatus().subscriptionState).toBe('partial')
  expect(log.error.mock.calls[1][0]).toMatchObject({
    acceptedCount: 1,
    refusedTopics: [topics[1]],
  })
  client.emit('connect')
  expect(log.info).toHaveBeenCalledWith(
    { topicCount: 2 },
    'MQTT subscriptions confirmed'
  )
  expect(reporting.getMqttReportingStatus().subscriptionState).toBe('confirmed')
  expect(client.subscribe.mock.calls.map(([filters]) => filters)).toEqual([
    topics,
    topics,
    topics,
  ])
})

test('repeated connection attempts produce a single outage and recovery summary', () => {
  for (let i = 0; i < 3; i++) {
    client.emit('error', new Error('synthetic-private-payload'))
    client.emit('close')
    client.emit('offline')
    client.emit('reconnect')
  }
  client.emit('connect')
  expect(log.warn).toHaveBeenCalledTimes(1)
  expect(log.error).toHaveBeenCalledTimes(1)
  expect(log.info).toHaveBeenCalledTimes(2)
  expect(log.info).toHaveBeenCalledWith(
    expect.objectContaining({ reconnectAttempts: 3 }),
    'MQTT connection restored'
  )
  client.emit('error', new Error('synthetic-private-payload'))
  expect(log.error).toHaveBeenCalledTimes(2)
  expect(JSON.stringify(log.error.mock.calls)).not.toContain(
    'synthetic-private-payload'
  )
})
