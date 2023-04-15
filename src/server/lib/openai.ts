import logger from '@lib/logger'
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai'
import { createReadStream } from 'fs'

interface OpenAIResponseError {
  message: string
  response?: {
    status: string
    data: unknown
  }
}

export const DEFAULT_MODEL = 'gpt-3.5-turbo'

const openAIConfiguration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(openAIConfiguration)

export async function chatCompletion(
  params: CreateChatCompletionRequest
): Promise<string> {
  logger.debug({ params }, 'Sending OpenAI chat completion request...')

  try {
    const completion = await openai.createChatCompletion(params)
    const response = completion.data.choices[0].message?.content ?? ''

    logger.debug({ response }, 'OpenAI response')

    return response
  } catch (err) {
    handleError(err as OpenAIResponseError)
    throw err
  }
}

export async function audioTranscription(
  inputFile: string,
  language: string = 'en'
): Promise<string> {
  logger.debug(
    { file: inputFile },
    'Sending OpenAI audio transcription request...'
  )

  try {
    const transcription = await openai.createTranscription(
      // @ts-ignore
      createReadStream(inputFile),
      'whisper-1',
      undefined,
      undefined,
      undefined,
      language
    )
    const response = transcription.data.text

    logger.debug({ response }, 'OpenAI response')

    return response
  } catch (err) {
    handleError(err as OpenAIResponseError)
    throw err
  }
}

function handleError(error: OpenAIResponseError) {
  if (error.response) {
    const { status, data } = error.response
    logger.error({ status, data })
  } else {
    logger.error({ err: error })
  }
}
