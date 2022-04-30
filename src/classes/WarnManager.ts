import { Markup } from 'telegraf'

import Warns from '../models/Warns'
import generateFullName from '../utils/generateFullName'
import ConfigManager from './ConfigManager'
import generateHTMLUserHyperlink from '../utils/generateHTMLUserHyperlink'
import adaptTextToHTML from '../utils/adaptTextToHTML'
import generateLinkToPost from '../utils/generateLinkToPost'
import LogManager from './LogManager'

const logManager = new LogManager('./src/classes/WarnManager.ts')
class WarnManager {
  static Warns = Warns
  public ctxModer
  public ctxIntruder
  public ctxBot

  static fetchUser (userId: string | number, chatId: number) {
    return Warns.findAll({
      where: {
        offenderId: userId,
        chatId,
        irrelevant: false
      }
    })
  }

  constructor (ctxModer, ctxIntruder, ctxBot) {
    this.ctxModer = ctxModer
    this.ctxIntruder = ctxIntruder
    this.ctxBot = ctxBot
  }

  public async add (botMessageIDAdminChat: number, reason: string) {
    return Warns.create({
      offenderId: this.ctxIntruder.from?.id,
      offenderFullName: generateFullName(this.ctxIntruder.from?.first_name, this.ctxIntruder.from?.last_name),
      moderatorId: this.ctxModer.from?.id,
      moderatorFullName: generateFullName(this.ctxModer.from?.first_name, this.ctxModer.from?.last_name),
      // @ts-ignore
      offenderMessageId: this.ctxIntruder.message_id,
      // @ts-ignore
      offenderMessageContent: this.ctxIntruder.text,
      chatId: this.ctxBot.chat.id,
      botMessageId: this.ctxBot.message_id,
      botMessageIDAdminChat,
      reason,
      irrelevant: false
    })
  }

  public async fetch () {
    return Warns.findAll({
      where: {
        offenderId: this.ctxIntruder.from?.id,
        irrelevant: false
      }
    })
  }

  public async clear () {
    await Warns.destroy({
      where: {
        offenderId: this.ctxIntruder.from?.id,
        irrelevant: true
      }
    })

    return Warns.update({ irrelevant: true }, {
      where: {
        offenderId: this.ctxIntruder.from?.id,
        irrelevant: false
      }
    })
  }

  public async report (reason: string, warnsLength: number) {
    if (!ConfigManager.data.adminChat) return

    const button1 = [Markup.button.callback('Удалить сообщение нарушителя', 'warn_delete_offending_message')]
    if (warnsLength !== 10) button1.push(Markup.button.callback('Снять предупреждение', 'unwarn'))
    const buttons = Markup.inlineKeyboard([button1,
      warnsLength !== 3
        ? [[3, 6, 10].includes(warnsLength)
            ? Markup.button.callback('Снять мут и выдать повторно на один час.', 'warn_mute_offender')
            : Markup.button.callback('Выдать мут на один час нарушителю', 'warn_mute_offender')]
        : []
    ])

    // @ts-ignore
    const intruderContent = this.ctxIntruder.text

    // @ts-ignore
    const intruderMsgId = this.ctxIntruder.message_id
    return this.ctxModer.telegram.sendMessage(ConfigManager.data.adminChat,
      `<b>— Выдача ${warnsLength} предупреждения.</b>
Нарушитель: ${generateHTMLUserHyperlink({ userId: this.ctxIntruder.from.id, username: this.ctxIntruder.from.username, firstName: this.ctxIntruder.from.first_name, lastName: this.ctxIntruder.from.last_name })}
Модератор: ${generateHTMLUserHyperlink({ userId: this.ctxModer.from.id, username: this.ctxModer.from.username, firstName: this.ctxModer.from.first_name, lastName: this.ctxModer.from.last_name })}
Причина: <code>${adaptTextToHTML(reason)}</code>

<b>— Дополнительная информация.</b>
Ссылка на сообщение нарушителя: <a href="${generateLinkToPost({ chatId: this.ctxIntruder.chat.id, chatName: this.ctxIntruder.chat.username, messageId: this.ctxIntruder.message_id })}">${intruderMsgId}</a>
Ссылка на сообщение выдачи варна: <a href="${generateLinkToPost({ chatId: this.ctxBot.chat.id, chatName: this.ctxBot.chat.username, messageId: this.ctxBot.message_id })}">${this.ctxBot.message_id}</a>
Сообщение нарушителя: ${!intruderContent ? '<i>Нет текста.</i>' : `<code>${adaptTextToHTML(intruderContent)}</code>`}`, { parse_mode: 'HTML', ...buttons })
      .catch((err) => logManager.error('Warn_Manager', 'Не удалось отправить сообщение в чат администрации', err.stack))
  }
}

export default WarnManager
