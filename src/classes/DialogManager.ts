import { Message, Update } from 'telegraf/typings/core/types/typegram'
import { Context } from 'telegraf'

import getRandomElement from '../utils/getRandomElement'
import LogManager from './LogManager'

import warnIndicationOfABot from '../content/cmd_warn/indication_of_a_bot'
import warnNoUserSpecified from '../content/cmd_warn/no_user_specified'
import warnAddToAdmin from '../content/cmd_warn/add_warn_to_admin'
import warnSelfWarning from '../content/cmd_warn/self-warning'

import muteIndicationOfABot from '../content/cmd_mute/indication_of_a_bot'
import muteNoUserSpecified from '../content/cmd_mute/no_user_specified'
import muteToAdmin from '../content/cmd_mute/to_admin'
import selfMute from '../content/cmd_mute/self-mute'

import unmuteIndicationOfABot from '../content/cmd_unmute/indication_of_a_bot'
import unmuteNoUserSpecified from '../content/cmd_unmute/no_user_specified'
import unmuteSelfUnmute from '../content/cmd_unmute/self-unmute'
import unmuteToAdmin from '../content/cmd_unmute/to_admin'

import unwarnIndicationOfABot from '../content/cmd_unwarn/indication_of_a_bot'
import unwarnNoUserSpecified from '../content/cmd_unwarn/no_user_specified'
import unwarnSelf from '../content/cmd_unwarn/self-unwarn'
import unwarnToAdmin from '../content/cmd_unwarn/to_admin'
import noWarnings from '../content/cmd_unwarn/noWarnings'

import doNotUseInDM from '../content/do_not_use_in_DM'
import meNotAdmin from '../content/me_not_administator'
import notAdmin from '../content/not_administrator'
import notOwner from '../content/not_owner'
import notRules from '../content/not_rules'
import notKey from '../content/not_key'
import rules from '../content/rules'

const logManager = new LogManager('./src/classes/DialogManager.ts')
type ctxType = Context<Update>

interface ReplaceArgument {
  [key: string]: string
}
class DialogManager {
  private static handleMessageDeletionError (err): void {
    logManager.error('DIALOG_MANAGER', 'Не удалось удалить сообщение.', err.stack)
  }

  private static async handler (ctx: ctxType, dialogues: Array<string>, deleteMsg: boolean, replace?: ReplaceArgument): Promise<string> {
    let text = getRandomElement(dialogues)
    if (replace) {
      const keys = Object.keys(replace)
      for (const key of keys) {
        text = text.replace('{' + key + '}', replace[key])
      }
    }

    try {
      const msg = await ctx.reply(text, {
        parse_mode: 'Markdown',
        reply_to_message_id: ctx.message?.message_id
      })

      if (!deleteMsg) return text
      setTimeout(() => {
        ctx.deleteMessage(msg.message_id).catch(DialogManager.handleMessageDeletionError)
        ctx.deleteMessage(ctx.message?.message_id).catch(DialogManager.handleMessageDeletionError)
      }, 11500)
    } catch (err) {
      logManager.error('DIALOG_MANAGER', 'Не удалось отправить сообщение.', err.stack, [`Content: ${text}`])
    } finally {
      // eslint-disable-next-line no-unsafe-finally
      return text
    }
  }

  static async notAdmin (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, notAdmin, true)
  }

  static async notOwner (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, notOwner, true)
  }

  static async notKey (ctx: ctxType, key: string): Promise<string> {
    return DialogManager.handler(ctx, notKey, false, { key })
  }

  static async meNotAdmin (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, meNotAdmin, false)
  }

  static async rules (ctx: ctxType, url: string): Promise<string> {
    return DialogManager.handler(ctx, rules, false, { url })
  }

  static async notRules (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, notRules, false)
  }

  static async doNotUseInDM (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, doNotUseInDM, false)
  }

  static async warnNoUserSpecified (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, warnNoUserSpecified, true)
  }

  static async warnIndicationOfABot (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, warnIndicationOfABot, true)
  }

  static async warnSelfWarning (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, warnSelfWarning, true)
  }

  static async warnAddToAdmin (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, warnAddToAdmin, true)
  }

  static async unmuteNoUserSpecified (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, unmuteNoUserSpecified, true)
  }

  static async unmuteIndicationOfABot (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, unmuteIndicationOfABot, true)
  }

  static async unmuteSelfUnmute (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, unmuteSelfUnmute, true)
  }

  static async unmuteToAdmin (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, unmuteToAdmin, true)
  }

  static async muteNoUserSpecified (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, muteNoUserSpecified, true)
  }

  static async muteIndicationOfABot (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, muteIndicationOfABot, true)
  }

  static async selfMute (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, selfMute, true)
  }

  static async muteToAdmin (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, muteToAdmin, true)
  }

  static async unwarnNoUserSpecified (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, unwarnNoUserSpecified, true)
  }

  static async unwarnIndicationOfABot (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, unwarnIndicationOfABot, true)
  }

  static async unwarnSelf (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, unwarnSelf, true)
  }

  static async unwarnToAdmin (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, unwarnToAdmin, true)
  }

  static async noWarnings (ctx: ctxType): Promise<string> {
    return DialogManager.handler(ctx, noWarnings, true)
  }

  static microlog (ctx: ctxType, time: number, content: string) {
    let stopped = false

    let msgBot: Promise<void | Message.TextMessage>
    const timeout = setTimeout(() => {
      msgBot = ctx.reply(`_${content}_`, {
        parse_mode: 'Markdown',
        reply_to_message_id: ctx.message?.message_id,
        allow_sending_without_reply: true
      }).catch((err) =>
        logManager.warn('MicroLog', 'Не удалось отправить сообщение с микрологом.', err.stack))
    }, time)

    return {
      stop: () => {
        if (stopped) return
        stopped = true
        clearTimeout(timeout)
        if (!msgBot) return
        msgBot.then((m) => {
          ctx.deleteMessage(m?.message_id).catch((err) =>
            logManager.warn('MicroLog', 'Не удалось удалить сообщение с микрологом.', err.stack))
        })
      }
    }
  }
}

export default DialogManager
