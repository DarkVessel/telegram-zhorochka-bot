// Модули и прочее.
import { promises } from '../../commands/Developer_Tools/eval'
import { Composer } from 'grammy'
import { inspect } from 'util'

// Классы.
import ConfigManager from '../../classes/ConfigManager'
import DialogManager from '../../classes/DialogManager'

// Диалоги.
import notOwner from '../../contents/inlineKeyboard/open_promise/notOwner.dialogues'
import notInfo from '../../contents/inlineKeyboard/open_promise/notInfo.dialogues'
import normalResponse from '../../contents/inlineKeyboard/open_promise/normalResponse.dialogues'

// Инструменты.
import generateFullName from '../../utils/generateFullName'

export const inlineButton = new Composer()

inlineButton.callbackQuery('open_promise', async (ctx) => {
  const fullName = generateFullName(ctx.from.first_name, ctx.from.last_name)
  const tags = { username: ctx.from.username ? `@${ctx.from.username}` : fullName, fullName }
  const messageId = ctx.update.callback_query.message?.message_id

  // Если на кнопку нажал не создатель бота.
  if (ConfigManager.data.botOwner !== ctx.from.id) {
    ctx.answerCallbackQuery(DialogManager.getRandomElementAndReplace(notOwner, tags))
    return
  }

  // Удаляем кнопки с сообщениями.
  await ctx.editMessageReplyMarkup(undefined)

  // Если не найдена информация о сообщении.
  if (!messageId || !promises.has(messageId)) {
    ctx.answerCallbackQuery(DialogManager.getRandomElementAndReplace(notInfo, tags))
    return
  }

  // Отвечаем пользователю, что нужно подождать.
  ctx.answerCallbackQuery(DialogManager.getRandomElementAndReplace(normalResponse, tags))

  const msg = await ctx.reply('_Open promise..._', {
    parse_mode: 'Markdown',
    reply_to_message_id: messageId
  })

  try {
    let evaled = promises.get(messageId) // Находим Promise.
    promises.delete(messageId) // УДаляем его из базы.
    evaled = await evaled // Раскрываем.

    // Проводим через inspect, чтобы выглядело как надо.
    const formatEvaled = inspect(evaled, { depth: 2, maxArrayLength: 20 })
      .replace(<string>process.env.BOT_TOKEN, 'Не в этот раз.')

    await ctx.editMessageText(`Promise is open!

\`\`\`
${formatEvaled}
\`\`\``, { parse_mode: 'Markdown' })
  } catch (err) {
    ctx.reply(`Произошла ошибка при открытии Promise.

\`\`\`
${err}
\`\`\``, {
      parse_mode: 'Markdown',
      reply_to_message_id: messageId,
      allow_sending_without_reply: true
    })
  } finally {
    ctx.api.deleteMessage(msg.chat.id, msg.message_id)
  }
  return 1
})
