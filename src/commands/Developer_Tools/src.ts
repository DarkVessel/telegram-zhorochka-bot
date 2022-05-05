import { generateBasicDialogTags, checkPermissions } from '../../utils/index'
import DialogManager from '../../classes/DialogManager'
import { Composer } from 'grammy'

// Диалоги.
import noReply from '../../contents/commands/"src"/noReply.dialogues'

export const cmd = new Composer()

cmd
  .command('src')
  .filter((ctx) => checkPermissions('src', ctx, {
    allowUseInDM: true,
    checkOwner: false,
    checkAdmin: false,
    checkMeAdmin: false
  }))
  .use((ctx) => {
    const dialogManager = new DialogManager(ctx.chat.id, ctx.message?.message_id)
    const replyMessage = ctx.message?.reply_to_message
    if (!replyMessage) {
      return dialogManager.send(noReply, {
        deleteMsg: true,
        tags: generateBasicDialogTags(ctx)
      })
    }

    const content = JSON.stringify(replyMessage, null, 2)
    if (content.length > 4096) {
      ctx.reply(`Слишком длинное сообщение, ${content.length} символов. Вывожу в консоль.`)
      console.log(content)
      return
    }

    return ctx.reply('```\n' + content + '\n```', {
      parse_mode: 'Markdown',
      reply_to_message_id: ctx.message?.message_id
    })
  })
