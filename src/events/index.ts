import { Composer } from 'grammy'

import { inlineButton as InlineButtonOpenPromise } from './inlineKeyboard/open_promise'
export const Events = new Composer()
Events.use(InlineButtonOpenPromise)
