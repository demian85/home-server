import { Context, NarrowedContext } from 'telegraf'
import {
  CallbackQuery,
  Message,
  Update,
} from 'telegraf/typings/core/types/typegram'

export interface FoodStockItem {
  name: string
  category: string
  stock: number
  expiry: string
}

export type FoodStockList = FoodStockItem[]

export type MessageContext = NarrowedContext<
  ContextWithSession<Update>,
  Update.MessageUpdate<Record<'text', {}> & Message.TextMessage>
>

export type CallbackQueryContext = NarrowedContext<
  ContextWithSession,
  Update.CallbackQueryUpdate<CallbackQuery>
>

export interface ContextWithSession<U extends Update = Update>
  extends Context<U> {
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
