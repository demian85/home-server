import { Context } from 'telegraf'
import type { CallbackQuery, Update } from 'telegraf/types'

export type MessageContext = ContextWithSession

export type CallbackQueryContext = ContextWithSession<
  Update.CallbackQueryUpdate<CallbackQuery>
>

export interface ContextWithSession<
  U extends Update = Update,
> extends Context<U> {
  session: {
    currentCommand: CurrentCommand | null
  }
}

export interface CurrentCommand {
  id: string
  step: number
  data?: string
}

export interface Handler {
  message: Array<(ctx: MessageContext) => Promise<void>>
  callbackQuery: Array<(ctx: CallbackQueryContext) => Promise<void>>
}
