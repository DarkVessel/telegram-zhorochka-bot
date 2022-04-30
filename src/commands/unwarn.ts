import DialogManager from '../classes/DialogManager'
import WarnManager from '../classes/WarnManager'
import Command from '../handlers/Command'
import adaptTextToHTML from '../utils/adaptTextToHTML'
import generateFullName from '../utils/generateFullName'
import generateLinkToPost from '../utils/generateLinkToPost'

import { timezone } from 'strftime'
import { Markup } from 'telegraf'
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import { Model } from 'sequelize/types'
const strftime = timezone(180)

interface RunningInlineKeyboard {
  authorId: number,
  offenderId: number,
  offenderFullName: string,
  warns: Model<any, any>[]
}
class UnwarnCommand extends Command {
  static runningInlineKeyboard: Map<string, RunningInlineKeyboard> = new Map()
  constructor () {
    super({
      allowUseInDM: false,
      checkMeAdmin: true,
      checkOwner: false,
      checkAdmin: true,
      name: 'unwarn',
      async run (ctx) {
        const chatAdministrators = await ctx.getChatAdministrators()

        // @ts-ignore
        const message = ctx.update.message.reply_to_message
        if (!message) return DialogManager.unwarnNoUserSpecified(ctx)
        if (message.from.id === ctx.botInfo?.id) return DialogManager.unwarnIndicationOfABot(ctx)
        if (message.from.id === ctx.message?.from.id) return DialogManager.unwarnSelf(ctx)
        const userAdmin = chatAdministrators.find(c => c.user.id === message.from.id)
        if (userAdmin && chatAdministrators.find((c) => c.status === 'creator')?.user.id !== ctx.message?.from.id) {
          return DialogManager.unwarnToAdmin(ctx)
        }

        const microlog = DialogManager.microlog(ctx, 1500, 'Подождите, проверяю личные дела этого господина...')
        const warns = await WarnManager.fetchUser(message.from.id, <number>ctx.chat?.id)
        microlog.stop()

        if (!warns.length) return DialogManager.noWarnings(ctx)
        const warn = warns.find(w => w.getDataValue('offenderMessageId') === message.message_id)
        if (warn) {
          const microlog2 = DialogManager.microlog(ctx, 1000, 'Подождите, удаляю...')
          await WarnManager.Warns.destroy({
            where: {
              id: warn.getDataValue('id')
            }
          })
          microlog2.stop()
          ctx.deleteMessage(ctx.message?.message_id)
          ctx.reply(`<b>Модератор <a href="tg://user?id=">${adaptTextToHTML(generateFullName(ctx.from?.first_name, ctx.from?.last_name))}</a> снял ${warns.indexOf(warn) + 1} предупреждение с пользователя <a href="tg://user?id=${message.from.id}">${adaptTextToHTML(generateFullName(message.from.first_name, message.from.last_name))}</a>.</b>`,
            { parse_mode: 'HTML', reply_to_message_id: message.message_id, allow_sending_without_reply: true })
        } else {
          const info = warns.map((warn, i) => {
            return `<b>— Предупреждение <a href="${generateLinkToPost({
              // @ts-ignore
              chatName: ctx.chat.username,
              chatId: ctx.chat?.id,
              messageId: warn.getDataValue('offenderMessageId')
            })}">№${i + 1}</a></b>
Дата: ${strftime('%d.%m.20%y %H:%M:%S', warn.getDataValue('createdAt'))}
Причина: <code>${adaptTextToHTML(warn.getDataValue('reason'))}</code>`
          }).join('\n\n')

          const buttons: Array<Array<InlineKeyboardButton.CallbackButton>> = []
          for (let i = 0; i < warns.length; i++) {
            const index = Math.floor(i / 3)
            if (!buttons[index]) buttons[index] = []
            buttons[index].push(Markup.button.callback(String(i + 1), 'cmd_unwarn_' + i))
          }

          buttons.push([Markup.button.callback('Отмена', 'cmd_unwarn_cancel')])
          const msg = await ctx.reply(`Выберите, какое предупреждение снять с пользователя <a href="tg://user?id=">${adaptTextToHTML(generateFullName(message.from?.first_name, message.from?.last_name))}</a>?

${info}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message?.message_id, allow_sending_without_reply: true, ...Markup.inlineKeyboard(buttons) })
          UnwarnCommand.runningInlineKeyboard.set(`${message.chat.id}-${msg.message_id}`, {
            authorId: <number>ctx.from?.id,
            offenderId: message.from.id,
            offenderFullName: generateFullName(message.from.first_name, message.from.last_name),
            warns
          })
        }
      }
    })
  }
}

export default UnwarnCommand
