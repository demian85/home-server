// Telegram errors can contain the request body, and network errors can contain a credentialed URL.
// Keep the classification and application call sites without serializing the error itself.
export function errorDetails(error: unknown) {
  if (!(error instanceof Error)) {
    return { name: 'UnknownError' }
  }

  const code = 'code' in error ? error.code : undefined
  const reason = [
    'WRONGPASS',
    'NOAUTH',
    'READONLY',
    'NOPERM',
    'LOADING',
    'chat not found',
    'bot was blocked',
    "can't parse entities",
    'message is not modified',
    'query is too old',
  ].find((known) => error.message.includes(known))
  const frames = (error.stack ?? '')
    .split('\n')
    .filter((line) => line.trimStart().startsWith('at '))
    .flatMap(
      (line) => line.match(/\bsrc\/[\w./-]+\.[jt]s:\d+:\d+(?=\)?$)/) ?? []
    )
    .slice(0, 4)

  return {
    name: /^[A-Za-z]{1,40}$/.test(error.name) ? error.name : 'Error',
    reason,
    code:
      typeof code === 'number' ||
      (typeof code === 'string' && /^[A-Z][A-Z_0-9]{1,48}$/.test(code))
        ? code
        : undefined,
    frames: frames.length ? frames : undefined,
  }
}
