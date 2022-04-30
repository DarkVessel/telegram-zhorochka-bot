import Command from '../handlers/Command'

class SrcCommand extends Command {
  constructor () {
    super({
      checkMeAdmin: false,
      allowUseInDM: true,
      checkAdmin: false,
      checkOwner: false,
      name: 'src',
      run (ctx) {
        // @ts-ignore
        const message = ctx.update.message.reply_to_message
        if (!message) return ctx.reply('Вы не ответили на сообщение.', { reply_to_message_id: ctx.message?.message_id })
        ctx.reply('```\n' + JSON.stringify(message, null, 2) + '\n```', {
          parse_mode: 'Markdown',
          reply_to_message_id: ctx.message?.message_id
        })
      }
    })
  }
}
export default SrcCommand
