import bot from '../../telegramClient'
import Mute from '../../models/Mute'
import cutInlineButton from '../../utils/cutInlineButton'
import LogManager from '../../classes/LogManager'
import isAdmin from '../../utils/isAdmin'

const logManager = new LogManager('./src/handlers/inlineKeyboards/mute_delete_offending_message.ts')
const timeout = {}
bot.action('mute_delete_offending_message', async (ctx) => {
  if (!timeout[<number>ctx.from?.id] || (Date.now() - timeout[<number>ctx.from?.id]) > 5000) {
    timeout[<number>ctx.from?.id] = Date.now()
    return ctx.answerCbQuery('Нажмите ещё раз на кнопку.')
  }

  const message = ctx.update?.callback_query?.message
  // @ts-ignore
  const inlineKeyboard = message?.reply_markup?.inline_keyboard

  if (!message?.from?.id) return ctx.answerCbQuery('Произошла ошибка.')
  const mute = await Mute.findOne({
    where: {
      botMessageIDAdminChat: message?.message_id
    }
  })

  if (!mute) {
    ctx.answerCbQuery('Не найдена информация об этом муте!')
    return ctx.editMessageReplyMarkup({ inline_keyboard: [] })
  }
  const chatId = mute.getDataValue('chatId')
  if (!chatId) {
    ctx.answerCbQuery('Нет информации, в каком чате был мут.')
    return ctx.editMessageReplyMarkup({ inline_keyboard: [] })
  }
  bot.telegram.getChatAdministrators(chatId)
    .then(async (admins) => {
      if (!isAdmin(admins, <number>ctx?.from?.id)) return ctx.answerCbQuery('Ты не администратор в чате, где выдали варн...')
      await cutInlineButton(ctx, inlineKeyboard, 'mute_delete_offending_message')
      bot.telegram.deleteMessage(mute.getDataValue('chatId'), mute.getDataValue('offenderMessageId'))
        .then(() => ctx.answerCbQuery('Сообщение было удалено.'))
        .catch(() => ctx.answerCbQuery('Сообщение не было найдено!'))
    }).catch(err => {
      logManager.error('BUTTON', 'Не удалось получить список админов.', err.stack)
      ctx.answerCbQuery('Не удалось получить список админов, возможно чат не найден.')
    })
})
