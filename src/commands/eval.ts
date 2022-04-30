import Command from '../handlers/Command'
import { Markup } from 'telegraf'
import { inspect } from 'util'
class EvalCommand extends Command {
  public static initTime = Date.now() + 1500
  public static promises: Map<number, Promise<any>> = new Map()
  constructor () {
    super({
      name: 'eval',
      checkMeAdmin: false,
      checkAdmin: false,
      checkOwner: true,
      allowUseInDM: true,
      async run (ctx, args) {
        if (Date.now() <= EvalCommand.initTime) return
        try {
          // eslint-disable-next-line no-eval
          const evaled = eval(args.join(' '))
          const formatEvaled = inspect(evaled, { depth: 2, maxArrayLength: 20 })
            .replace(<string>process.env.BOT_TOKEN, 'Не в этот раз.')

          if (formatEvaled.length > 4096) return ctx.reply(`Слишком длинное сообщение, ${formatEvaled.length} символов.`)

          let button
          if (evaled instanceof Promise) {
            button = Markup.inlineKeyboard([Markup.button.callback('Open promise', 'open_promise')])
          }

          const msg = await ctx.reply('```\n' + formatEvaled + '\n```', {
            parse_mode: 'Markdown',
            reply_to_message_id: ctx.message?.message_id,
            allow_sending_without_reply: true,
            ...button
          })

          if (evaled instanceof Promise) {
            EvalCommand.promises.set(msg.message_id, evaled)
          }
        } catch (error) {
          ctx.reply('```\n' + error.message + '\n```', {
            parse_mode: 'Markdown',
            reply_to_message_id: ctx.message?.message_id,
            allow_sending_without_reply: true
          }).catch(console.error)
        }
      }
    })
  }
}
export default EvalCommand
