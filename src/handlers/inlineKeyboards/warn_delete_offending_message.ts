import bot from '../../telegramClient'
import Warns from '../../models/Warns'
import cutInlineButton from '../../utils/cutInlineButton'
import LogManager from '../../classes/LogManager'
import isAdmin from '../../utils/isAdmin'

const logManager = new LogManager('./src/handlers/inlineKeyboards/warn_delete_offending_message.ts')
const timeout = {}
bot.action('warn_delete_offending_message', async (ctx) => {
  if (!timeout[<number>ctx.from?.id] || (Date.now() - timeout[<number>ctx.from?.id]) > 5000) {
    timeout[<number>ctx.from?.id] = Date.now()
    return ctx.answerCbQuery('Нажмите ещё раз на кнопку.')
  }

  const message = ctx.update?.callback_query?.message
  // @ts-ignore
  const inlineKeyboard = message?.reply_markup?.inline_keyboard

  if (!message?.from?.id) return ctx.answerCbQuery('Произошла ошибка.')
  const warn = await Warns.findOne({
    where: {
      botMessageIDAdminChat: message?.message_id
    }
  })

  if (!warn) {
    ctx.answerCbQuery('Не найдена информация об этом варне!')
    return ctx.editMessageReplyMarkup({ inline_keyboard: [] })
  }
  const chatId = warn.getDataValue('chatId')
  if (!chatId) {
    ctx.answerCbQuery('Нет информации, в каком чате был варн.')
    return ctx.editMessageReplyMarkup({ inline_keyboard: [] })
  }
  bot.telegram.getChatAdministrators(chatId)
    .then(async (admins) => {
      if (!isAdmin(admins, <number>ctx?.from?.id)) return ctx.answerCbQuery('Ты не администратор в чате, где выдали варн...')
      await cutInlineButton(ctx, inlineKeyboard, 'warn_delete_offending_message')
      bot.telegram.deleteMessage(warn.getDataValue('chatId'), warn.getDataValue('offenderMessageId'))
        .then(() => ctx.answerCbQuery('Сообщение было удалено.'))
        .catch(() => ctx.answerCbQuery('Сообщение не было найдено!'))
    }).catch(err => {
      logManager.error('BUTTON', 'Не удалось получить список админов.', err.stack)
      ctx.answerCbQuery('Не удалось получить список админов, возможно чат не найден.')
    })
})
