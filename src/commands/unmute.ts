import DialogManager from '../classes/DialogManager'
import Command from '../handlers/Command'
import bot from '../telegramClient'

import unmute from '../content/cmd_unmute/unmute'
import getRandomElement from '../utils/getRandomElement'
import generateHTMLUserHyperlink from '../utils/generateHTMLUserHyperlink'

class UnmuteCommand extends Command {
  constructor () {
    super({
      checkAdmin: true,
      checkMeAdmin: true,
      checkOwner: false,
      allowUseInDM: false,
      name: 'unmute',
      run: async (ctx) => {
        const chatAdministrators = await ctx.getChatAdministrators()
        // @ts-ignore
        const message = ctx.update.message.reply_to_message
        if (!message) return DialogManager.unmuteNoUserSpecified(ctx)
        if (message.from.id === bot.botInfo?.id) return DialogManager.unmuteIndicationOfABot(ctx)
        if (message.from.id === ctx.message?.from?.id) return DialogManager.unmuteSelfUnmute(ctx)

        const userAdmin = chatAdministrators.find(c => c.user.id === message.from.id)
        if (userAdmin) return DialogManager.unmuteToAdmin(ctx)

        const microlog = DialogManager.microlog(ctx, 1500, 'Подождите...')
        ctx.restrictChatMember(message.from.id, {
          permissions: {
            can_send_messages: true,
            can_send_media_messages: true,
            can_send_polls: true,
            can_add_web_page_previews: true,
            can_send_other_messages: true
          }
        }).then(() => {
          microlog.stop()
          ctx.reply('<b>' + getRandomElement(unmute).replace('{user}', generateHTMLUserHyperlink({
            userId: message.from.id,
            firstName: message.from.first_name,
            lastName: message.from.last_name
          })) + '</b>', { parse_mode: 'HTML', reply_to_message_id: ctx.message?.message_id, allow_sending_without_reply: true })
        }).catch(console.error)
      }
    })
  }
}

export default UnmuteCommand
