import generateHTMLUserHyperlink from './generateHTMLUserHyperlink'
import CommandContext from '../types/CommandContext'
import { Context } from 'grammy'

interface Tags {
  [key: string]: string
}

/**
 * Сгенерировать основные базовые теги для диалогов. Под тегом подразумеваются такие выражения: {tag}
 * @param ctx Context сообщения от которого нужно сгенерировать теги.
 * @param tags Ваши дополнительные теги
 */
function generateBasicDialogTags (ctx: CommandContext<Context>, tags?: Tags): Tags {
  const obj1: Tags = {
    username: generateHTMLUserHyperlink(ctx),
    fullName: generateHTMLUserHyperlink({
      userId: ctx.from?.id,
      firstName: ctx.from?.first_name,
      lastName: ctx.from?.last_name
    })
  }

  const replyMessage = ctx.message?.reply_to_message
  if (replyMessage) {
    obj1.replyUsername = generateHTMLUserHyperlink(replyMessage)
    obj1.replyFullName = generateHTMLUserHyperlink({
      userId: replyMessage?.from?.id,
      firstName: replyMessage.from?.first_name,
      lastName: replyMessage.from?.last_name
    })
  }

  return Object.assign(obj1, tags ?? {})
}

export default generateBasicDialogTags
