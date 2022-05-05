import { checkPermissions, getArgs } from '../../utils/index'
import { Composer, InlineKeyboard } from 'grammy'
import { inspect } from 'util'

import bot from '../../telegramClient'

export const cmd = new Composer()
export const promises: Map<number, Promise<any>> = new Map()
const inlineButtons = new InlineKeyboard().text('Open Promise!', 'open_promise')

cmd
  .command('eval')
  .filter((ctx) => {
    if (Date.now() < <number>bot.initTime + 1500) return false

    return checkPermissions('eval', ctx, {
      allowUseInDM: true,
      checkOwner: true,
      checkAdmin: false,
      checkMeAdmin: false
    })
  })
  .use(async (ctx) => {
    try {
      const args = getArgs(ctx.message?.text)
      // eslint-disable-next-line no-eval
      const evaled = eval(args.join(' '))

      // Форматируем вывод.
      const formatEvaled = inspect(evaled, { depth: 2, maxArrayLength: 20 })
        .replace(<string>process.env.BOT_TOKEN, 'Не в этот раз.')

      if (formatEvaled.length > 4096) {
        ctx.reply(`Слишком длинное сообщение, ${formatEvaled.length} символов. Вывожу в консоль.`)
        console.log(formatEvaled)
        return
      }

      const msg = await ctx.reply('```\n' + formatEvaled + '\n```', {
        parse_mode: 'Markdown',
        reply_to_message_id: ctx.message?.message_id,
        allow_sending_without_reply: true,
        reply_markup: (evaled instanceof Promise) ? inlineButtons : undefined
      })

      if (evaled instanceof Promise) {
        promises.set(msg.message_id, evaled)
      }
    } catch (error) {
      ctx.reply('```\n' + String(error) + '\n```', {
        parse_mode: 'Markdown',
        reply_to_message_id: ctx.message?.message_id,
        allow_sending_without_reply: true
      }).catch(console.error)
    }
  })
