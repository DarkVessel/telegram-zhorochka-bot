import DialogManager from '../classes/DialogManager'
import Command from '../handlers/Command'
import LogManager from '../classes/LogManager'
import generateHTMLUserHyperlink from '../utils/generateHTMLUserHyperlink'
import getRandomElement from '../utils/getRandomElement'
import confirmationToMute from '../content/cmd_mute/confirmation_to_mute'
import { Context, Markup } from 'telegraf'

import giveMute from '../handlers/cmd/giveMute'
import Extra from '../interfaces/CMD_ExtraGiveMute'
import { Update } from 'telegraf/typings/core/types/typegram'
import isAdmin from '../utils/isAdmin'

interface RunningKeyboard {
  userId: number,
  ctxIntruder: Context<Update>,
  ctxModer: Context<Update>,
  reason: string,
  timeout: any,
  extra: Extra
}
const logManager = new LogManager('./src/commands/mute.ts')

const ms = require('ms')
class MuteCommand extends Command {
  static runningKeyboards: Map<number, RunningKeyboard> = new Map()
  constructor () {
    super({
      allowUseInDM: false,
      checkMeAdmin: true,
      checkOwner: false,
      checkAdmin: true,
      name: 'mute',
      async run (ctx, args) {
        const chatAdministrators = await ctx.getChatAdministrators()

        // @ts-ignore
        const message = ctx.update.message.reply_to_message
        if (!message) return DialogManager.muteNoUserSpecified(ctx)
        if (message.from.id === ctx.botInfo?.id) return DialogManager.muteIndicationOfABot(ctx)
        if (message.from.id === ctx.message?.from.id) return DialogManager.selfMute(ctx)
        if (isAdmin(chatAdministrators, message.from.id)) return DialogManager.muteToAdmin(ctx)

        const moderatorHyperlink = generateHTMLUserHyperlink({
          username: ctx.from?.username,
          userId: ctx.from?.id,
          firstName: ctx.from?.first_name,
          lastName: ctx.from?.last_name
        })

        let summa = 0
        let reason: string = ''
        for (let i = 0; i < args.length; i++) {
          const m = ms(args[i])
          if (!m) {
            reason = args.slice(i).join(' ')
            break
          }
          summa += m
        }

        if (!reason) {
          ctx.deleteMessage(ctx.message?.message_id)
          ctx.telegram.sendMessage(<number>ctx.from?.id, 'Нельзя давать мут без указания причины!!!').catch((err) => {
            ctx.reply(`${moderatorHyperlink}, нельзя давать мут без причины.`, { parse_mode: 'HTML' })
              .then(msg => {
                setTimeout(() => {
                  ctx.deleteMessage(msg.message_id)
                }, 7500)
              })
            logManager.warn('COMMAND_MUTE', 'Не удалось отправить сообщение в ЛС.', err.stack)
          })
          return
        }

        if (summa < 1000) {
          const text = 'Вы хотите заставить его молчать всю свою жизнь?'

          const answers = getRandomElement(confirmationToMute)
          const msg = await ctx.reply(text, {
            parse_mode: 'HTML',
            reply_to_message_id: ctx.message?.message_id,
            ...Markup.keyboard(answers).resize().oneTime().selective()
          })
          MuteCommand.runningKeyboards.set(msg.message_id, {
            userId: <number>ctx.from?.id,
            ctxIntruder: message,
            ctxModer: ctx,
            reason: args.join(' '),
            timeout: setTimeout(() => {
              MuteCommand.runningKeyboards.delete(msg.message_id)
              ctx.deleteMessage(ctx.message?.message_id)
              ctx.deleteMessage(msg.message_id)
            }, 20000),
            extra: { moderatorHyperlink, summa }
          })
          return
        }

        // TODO: Отправлять сообщение в ЛС, всё тоже самое как с причиной.
        // ! TODO: ДЛЯ РЕФАКТОРИНГА
        if (summa < 60000) return ctx.reply('Можно замутить минимум на 60 секунд!', { reply_to_message_id: ctx.message?.message_id })

        ctx.deleteMessage(ctx.message?.message_id)
        giveMute(reason, message, ctx, {
          moderatorHyperlink, summa
        })
      }
    })
  }
}
export default MuteCommand
