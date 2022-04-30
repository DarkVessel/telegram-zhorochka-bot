import bot from '../../telegramClient'
import Warns from '../../models/Warns'
import LogManager from '../../classes/LogManager'
import isAdmin from '../../utils/isAdmin'
import adaptTextToHTML from '../../utils/adaptTextToHTML'
import generateFullName from '../../utils/generateFullName'
import cutInlineButton from '../../utils/cutInlineButton'

const logManager = new LogManager('./src/handlers/inlineKeyboards/warn_mute_offender.ts')
const timeout = {}
bot.action('warn_mute_offender', async (ctx) => {
  if (!timeout[<number>ctx.from?.id] || (Date.now() - timeout[<number>ctx.from?.id]) > 5000) {
    timeout[<number>ctx.from?.id] = Date.now()
    return ctx.answerCbQuery('Нажмите ещё раз на кнопку.')
  }

  const message = ctx.update?.callback_query?.message
  // @ts-ignore
  const inlineKeyboard = message?.reply_markup?.inline_keyboard

  if (!message?.from?.id || !ctx.from) return ctx.answerCbQuery('Произошла ошибка.')
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
      if (!isAdmin(admins, <number>ctx.from?.id)) return ctx.answerCbQuery('Ты не администратор в чате, где выдали варн...')
      if (isAdmin(admins, warn.getDataValue('offenderId'))) return ctx.answerCbQuery('Я не смогу выдать мут администратору!')
      await cutInlineButton(ctx, inlineKeyboard, 'warn_mute_offender')
      await bot.telegram.restrictChatMember(chatId, warn.getDataValue('offenderId'), {
        permissions: {
          can_send_messages: false,
          can_change_info: false
        },
        until_date: Math.floor(Date.now() / 1000) + (60 * 60)
      })
      ctx.answerCbQuery('Готово! Мут выдан на один час.')
      const text = `<b>Модератор <a href="tg://user?id=">${adaptTextToHTML(generateFullName(ctx.from?.first_name, ctx.from?.last_name))}</a> выдал мут пользователю <a href="tg://user?id=${warn.getDataValue('offenderId')}">${adaptTextToHTML(warn.getDataValue('offenderFullName'))}</a> на один час.</b>`

      ctx.reply(text, {
        parse_mode: 'HTML',
        reply_to_message_id: message.message_id,
        allow_sending_without_reply: true
      })

      if (ctx.chat?.id === chatId) return
      bot.telegram.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_to_message_id: warn.getDataValue('botMessageId'),
        allow_sending_without_reply: true
      })
    }).catch(err => {
      logManager.error('BUTTON', 'Не удалось получить список админов.', err.stack)
      ctx.answerCbQuery('Не удалось получить список админов, возможно чат не найден.')
    })
})
