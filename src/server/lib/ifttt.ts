export async function callWebhook(
  event: string,
  value1?: string,
  value2?: string,
  value3?: string
) {
  const base = process.env.IFTTT_WEBHOOK_BASE_URL
  const key = process.env.IFTTT_WEBHOOK_KEY
  const url = new URL(`${base}/${event}/with/key/${key}`)
  if (value1) {
    url.searchParams.append('value1', value1)
  }
  if (value2) {
    url.searchParams.append('value2', value2)
  }
  if (value3) {
    url.searchParams.append('value3', value3)
  }

  const res = await fetch(url.toString())

  if (!res.ok) {
    throw new Error(`HTTP request failed with status code: ${res.status}`)
  }
}
