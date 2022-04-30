import bot from '../../telegramClient'
import UnwarnCommand from '../../commands/unwarn'
import Warns from '../../models/Warns'
import adaptTextToHTML from '../../utils/adaptTextToHTML'
import generateFullName from '../../utils/generateFullName'

const timeout = [{}, {}, {}, {}, {}, {}, {}, {}, {}]
function unwarn (i: number, ctx) {
  if (!timeout[i][<number>ctx.from?.id] || (Date.now() - timeout[i][<number>ctx.from?.id]) > 5000) {
    timeout[i][<number>ctx.from?.id] = Date.now()
    return ctx.answerCbQuery('Нажмите ещё раз на кнопку.')
  }
  const { callback_query: callbackQuery } = ctx.update
  const { message } = callbackQuery
  if (!message?.message_id) return ctx.answerCbQuery('Произошла какая-то ошибка.')

  const inlineKeyboard = UnwarnCommand.runningInlineKeyboard.get(`${message.chat.id}-${message?.message_id}`)
  if (!inlineKeyboard) {
    ctx.answerCbQuery('Информация не найдена, пропишите команду ещё раз.')
    ctx.deleteMessage(message.message_id)
    // @ts-ignore
    ctx.deleteMessage(message.reply_to_message.message_id)
    return
  }
  if (inlineKeyboard.authorId !== callbackQuery.from.id) return ctx.answerCbQuery('Кыш')

  const warn = inlineKeyboard.warns[i]
  console.log(warn.getDataValue('id'))
  Warns.destroy({
    where: {
      id: warn.getDataValue('id')
    }
  }).then(async () => {
    await ctx.answerCbQuery('Готово!')
    ctx.deleteMessage(message.message_id)
    // @ts-ignore
    ctx.deleteMessage(message.reply_to_message.message_id)
    ctx.reply(`<b>Модератор <a href="tg://user?id=">${adaptTextToHTML(generateFullName(callbackQuery.from?.first_name, callbackQuery.from?.last_name))}</a> снял ${i + 1} предупреждение с пользователя <a href="tg://user?id=${inlineKeyboard.offenderId}">${adaptTextToHTML(inlineKeyboard.offenderFullName)}</a>.</b>`, {
      parse_mode: 'HTML',
      reply_to_message_id: warn.getDataValue('offenderMessageId'),
      allow_sending_without_reply: true
    })
  })
}
for (let i = 0; i < 9; i++) {
  bot.action('cmd_unwarn_' + i, (ctx) => unwarn(i, ctx))
}

bot.action('cmd_unwarn_cancel', async (ctx) => {
  const { callback_query: callbackQuery } = ctx.update
  const { message } = callbackQuery
  if (!message?.message_id) return ctx.answerCbQuery('Произошла какая-то ошибка.')

  const inlineKeyboard = UnwarnCommand.runningInlineKeyboard.get(`${message.chat.id}-${message?.message_id}`)
  if (!inlineKeyboard) {
    ctx.answerCbQuery('Информация не найдена, пропишите команду ещё раз.')
    ctx.deleteMessage(message.message_id)
    // @ts-ignore
    ctx.deleteMessage(message.reply_to_message.message_id)
    return
  }
  if (inlineKeyboard.authorId !== callbackQuery.from.id) return ctx.answerCbQuery('Кыш')

  ctx.answerCbQuery('Удалено!')
  // @ts-ignore
  UnwarnCommand.runningInlineKeyboard.delete(ctx?.message?.reply_markup?.message_id)
  ctx.deleteMessage(message.message_id)
  // @ts-ignore
  ctx.deleteMessage(message.reply_to_message.message_id)
})
