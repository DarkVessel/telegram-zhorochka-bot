import bot from '../../telegramClient'
import Warns from '../../models/Warns'
import LogManager from '../../classes/LogManager'
import isAdmin from '../../utils/isAdmin'
import adaptTextToHTML from '../../utils/adaptTextToHTML'
import generateFullName from '../../utils/generateFullName'

const logManager = new LogManager('./src/handlers/inlineKeyboards/unwarn.ts')
const timeout = {}
bot.action('unwarn', async (ctx) => {
  if (!timeout[<number>ctx.from?.id] || (Date.now() - timeout[<number>ctx.from?.id]) > 5000) {
    timeout[<number>ctx.from?.id] = Date.now()
    return ctx.answerCbQuery('Нажмите ещё раз на кнопку.')
  }

  const message = ctx.update?.callback_query?.message
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
  if (warn.getDataValue('offenderId') === ctx.from.id) return ctx.answerCbQuery('Ты не можешь снять с себя же предупреждение :)')
  const chatId = warn.getDataValue('chatId')
  if (!chatId) {
    ctx.answerCbQuery('Нет информации, в каком чате был варн.')
    return ctx.editMessageReplyMarkup({ inline_keyboard: [] })
  }
  bot.telegram.getChatAdministrators(chatId)
    .then(async (admins) => {
      if (!isAdmin(admins, <number>ctx?.from?.id)) return ctx.answerCbQuery('Ты не администратор в чате, где выдали варн...')
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] })
      await Warns.destroy({
        where: {
          id: warn.getDataValue('id')
        }
      })

      ctx.answerCbQuery('Готово! Предупреждение снято.')
      const text = `<b>Модератор <a href="tg://user?id=">${adaptTextToHTML(generateFullName(ctx.from?.first_name, ctx.from?.last_name))}</a> снял предупреждение с пользователя <a href="tg://user?id=${warn.getDataValue('offenderId')}">${adaptTextToHTML(warn.getDataValue('offenderFullName'))}</a>.</b>`

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
