import bot from '../../telegramClient'
import Mute from '../../models/Mute'
import LogManager from '../../classes/LogManager'
import isAdmin from '../../utils/isAdmin'
import adaptTextToHTML from '../../utils/adaptTextToHTML'
import generateFullName from '../../utils/generateFullName'
import cutInlineButton from '../../utils/cutInlineButton'

const logManager = new LogManager('./src/handlers/inlineKeyboards/unmute.ts')
const timeout = {}
bot.action('unmute', async (ctx) => {
  if (!timeout[<number>ctx.from?.id] || (Date.now() - timeout[<number>ctx.from?.id]) > 5000) {
    timeout[<number>ctx.from?.id] = Date.now()
    return ctx.answerCbQuery('Нажмите ещё раз на кнопку.')
  }

  const message = ctx.update?.callback_query?.message
  // @ts-ignore
  const inlineKeyboard = message?.reply_markup?.inline_keyboard

  if (!message?.from?.id || !ctx.from) return ctx.answerCbQuery('Произошла ошибка.')
  const mute = await Mute.findOne({
    where: {
      botMessageIDAdminChat: message?.message_id
    }
  })

  if (!mute) {
    ctx.answerCbQuery('Не найдена информация об этом муте!')
    return ctx.editMessageReplyMarkup({ inline_keyboard: [] })
  }
  if (mute.getDataValue('offenderId') === ctx.from.id) return ctx.answerCbQuery('Ты не можешь снять с себя же мут, у тебя его не должно быть :)')
  const chatId = mute.getDataValue('chatId')
  if (!chatId) {
    ctx.answerCbQuery('Нет информации, в каком чате был мут.')
    return ctx.editMessageReplyMarkup({ inline_keyboard: [] })
  }
  bot.telegram.getChatAdministrators(chatId)
    .then(async (admins) => {
      if (!isAdmin(admins, <number>ctx?.from?.id)) return ctx.answerCbQuery('Ты не администратор в чате, где выдали варн...')
      await cutInlineButton(ctx, inlineKeyboard, 'unmute')

      await bot.telegram.restrictChatMember(chatId, mute.getDataValue('offenderId'), {
        permissions: {
          can_send_messages: true,
          can_send_media_messages: true,
          can_send_polls: true,
          can_add_web_page_previews: true,
          can_send_other_messages: true
        }
      })

      ctx.answerCbQuery('Готово! Мут снят.')
      const text = `<b>Модератор <a href="tg://user?id=">${adaptTextToHTML(generateFullName(ctx.from?.first_name, ctx.from?.last_name))}</a> снял мут с пользователя <a href="tg://user?id=${mute.getDataValue('offenderId')}">${adaptTextToHTML(mute.getDataValue('offenderFullName'))}</a>.</b>`

      ctx.reply(text, {
        parse_mode: 'HTML',
        reply_to_message_id: message.message_id,
        allow_sending_without_reply: true
      })

      if (ctx.chat?.id === chatId) return
      bot.telegram.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_to_message_id: mute.getDataValue('botMessageId'),
        allow_sending_without_reply: true
      })
    }).catch(err => {
      logManager.error('BUTTON', 'Не удалось получить список админов.', err.stack)
      ctx.answerCbQuery('Не удалось получить список админов, возможно чат не найден.')
    })
})
