import DialogManager from '../classes/DialogManager'
import Command from '../handlers/Command'
import WarnManager from '../classes/WarnManager'
import LogManager from '../classes/LogManager'
import generateHTMLUserHyperlink from '../utils/generateHTMLUserHyperlink'
import getRandomElement from '../utils/getRandomElement'
import confirmationToWarn from '../content/cmd_warn/confirmation_to_warn'
import { Context, Markup } from 'telegraf'
import adaptTextToHTML from '../utils/adaptTextToHTML'

import addWarn from '../handlers/cmd/addWarn'
import Extra from '../interfaces/CMD_ExtraAddWarn'
import { Update } from 'telegraf/typings/core/types/typegram'

interface RunningKeyboard {
  userId: number,
  ctxIntruder: Context<Update>,
  ctxModer: Context<Update>,
  reason: string,
  timeout: any,
  extra: Extra
}
const logManager = new LogManager('./src/commands/warn.ts')
class WarnCommand extends Command {
  static runningKeyboards: Map<number, RunningKeyboard> = new Map()
  constructor () {
    super({
      allowUseInDM: false,
      checkMeAdmin: true,
      checkOwner: false,
      checkAdmin: true,
      name: 'warn',
      async run (ctx, args) {
        const chatAdministrators = await ctx.getChatAdministrators()

        // @ts-ignore
        const message = ctx.update.message.reply_to_message
        if (!message) return DialogManager.warnNoUserSpecified(ctx)
        if (message.from.id === ctx.botInfo?.id) return DialogManager.warnIndicationOfABot(ctx)
        if (message.from.id === ctx.message?.from.id) return DialogManager.warnSelfWarning(ctx)
        const userAdmin = chatAdministrators.find(c => c.user.id === message.from.id)
        if (userAdmin && chatAdministrators.find((c) => c.status === 'creator')?.user.id !== ctx.message?.from.id) {
          return DialogManager.warnAddToAdmin(ctx)
        }

        const moderatorHyperlink = generateHTMLUserHyperlink({
          username: ctx.from?.username,
          userId: ctx.from?.id,
          firstName: ctx.from?.first_name,
          lastName: ctx.from?.last_name
        })
        if (!args.length) {
          ctx.deleteMessage(ctx.message?.message_id)
          ctx.telegram.sendMessage(<number>ctx.from?.id, 'Нельзя давать предупреждения без указания причины!!!').catch((err) => {
            ctx.reply(`${moderatorHyperlink}, нельзя давать предупреждения без причины.`, { parse_mode: 'HTML' })
              .then(msg => {
                setTimeout(() => {
                  ctx.deleteMessage(msg.message_id)
                }, 7500)
              })
            logManager.warn('COMMAND_WARN', 'Не удалось отправить сообщение в ЛС.', err.stack)
          })
          return
        }

        const microlog = DialogManager.microlog(ctx, 1000, 'Подождите, проверяю личные дела этого господина...')
        const warns = await WarnManager.fetchUser(message.from.id, <number>ctx.chat?.id)
        microlog.stop()
        const warn = warns.find(w => w.getDataValue('offenderMessageId') === message.message_id)
        if (warn) {
          const moderatorFullName = warn.getDataValue('moderatorFullName')
          const text = ctx.from?.id === warn.getDataValue('moderatorId')
            ? 'Вы уже выдали этому пользователю предупреждение. Хотите выдать ещё раз?'
            : `Этот пользователь уже получал предупреждение от модератора${moderatorFullName ? ` (<code>${adaptTextToHTML(moderatorFullName)}</code>)` : ''}. Хотите выдать ещё одно?`

          const answers = getRandomElement(confirmationToWarn)
          const msg = await ctx.reply(text, {
            parse_mode: 'HTML',
            reply_to_message_id: ctx.message?.message_id,
            ...Markup.keyboard(answers).resize().oneTime().selective()
          })
          WarnCommand.runningKeyboards.set(msg.message_id, {
            userId: <number>ctx.from?.id,
            ctxIntruder: message,
            ctxModer: ctx,
            reason: args.join(' '),
            timeout: setTimeout(() => {
              WarnCommand.runningKeyboards.delete(msg.message_id)
              ctx.deleteMessage(ctx.message?.message_id)
              ctx.deleteMessage(msg.message_id)
            }, 20000),
            extra: { userAdmin, moderatorHyperlink, warnsLength: warns.length + 1 }
          })
          return
        }

        ctx.deleteMessage(ctx.message?.message_id)
        addWarn(args.join(' '), message, ctx, {
          userAdmin, moderatorHyperlink
        })
      }
    })
  }
}
export default WarnCommand
