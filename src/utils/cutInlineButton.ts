import { Context } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'

interface InlineKeyboardButton {
  text: string,
  // eslint-disable-next-line camelcase
  callback_data: string
}
function cutInlineButton (ctx: Context<Update>, inlineKeyboard: Array<Array<InlineKeyboardButton>>, ...elements: string[]) {
  inlineKeyboard.forEach((arr, i) => {
    inlineKeyboard[i] = arr.filter(obj => !elements.includes(obj.callback_data))
  })

  return ctx.editMessageReplyMarkup({ inline_keyboard: inlineKeyboard })
}

export default cutInlineButton
