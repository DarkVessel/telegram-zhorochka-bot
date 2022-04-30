import ConfigManager from '../../classes/ConfigManager'
import EvalCommand from '../../commands/eval'
import bot from '../../telegramClient'
import { inspect } from 'util'
bot.action('open_promise', async (ctx) => {
  const id = ctx.update?.callback_query?.message?.message_id
  if (ConfigManager.data.bot_owner !== ctx.from?.id) return ctx.answerCbQuery('Ты не можешь нажимать на эту кнопку.')
  if (!id || !EvalCommand.promises.has(id)) return ctx.answerCbQuery('Информация об этом сообщении не найдена.')

  ctx.answerCbQuery('Ожидайте...')
  await ctx.editMessageReplyMarkup(undefined)
  const msg = await ctx.reply('_Open promise..._', {
    parse_mode: 'Markdown',
    reply_to_message_id: id
  })

  try {
    let evaled = EvalCommand.promises.get(id)
    EvalCommand.promises.delete(id)
    evaled = await evaled

    const formatEvaled = inspect(evaled, { depth: 2, maxArrayLength: 50 })
      .replace(<string>process.env.BOT_TOKEN, 'Не в этот раз.')

    await ctx.editMessageText(`Promise is open!

\`\`\`
${formatEvaled}
\`\`\``, { parse_mode: 'Markdown' })
  } catch (err) {
    ctx.reply(`Произошла ошибка при открытии Promise.

\`\`\`
${err.stack}
\`\`\``, {
      parse_mode: 'Markdown',
      reply_to_message_id: id,
      allow_sending_without_reply: true
    })
  } finally {
    ctx.deleteMessage(msg.message_id)
  }
})
