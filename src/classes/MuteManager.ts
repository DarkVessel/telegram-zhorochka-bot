import { Markup } from 'telegraf'
import ConfigManager from './ConfigManager'
import generateHTMLUserHyperlink from '../utils/generateHTMLUserHyperlink'
import adaptTextToHTML from '../utils/adaptTextToHTML'
import generateLinkToPost from '../utils/generateLinkToPost'
import duration from '../utils/duration'
import { timezone } from 'strftime'
import MuteModel from '../models/Mute'
import LogManager from './LogManager'
import bot from '../telegramClient'
import generateFullName from '../utils/generateFullName'

const strftime = timezone(180) // 180 - это московская таймзона.

const logManager = new LogManager('./src/classes/MuteManager.ts')
class MuteManager {
  public ctxModer
  public ctxIntruder
  public ctxBot

  constructor (ctxModer, ctxIntruder, ctxBot) {
    this.ctxModer = ctxModer
    this.ctxIntruder = ctxIntruder
    this.ctxBot = ctxBot
  }

  private saveToDB (botMessageIDAdminChat: number | undefined, reason: string) {
    return MuteModel.create({
      offenderId: this.ctxIntruder.from?.id,
      offenderUsername: this.ctxIntruder.from?.username,
      offenderFullName: generateFullName(this.ctxIntruder.from?.first_name, this.ctxIntruder.from?.last_name),
      moderatorId: this.ctxModer.from?.id,
      moderatorUsername: this.ctxModer.from?.username,
      moderatorFullName: generateFullName(this.ctxModer.from?.first_name, this.ctxModer.from?.last_name),
      // @ts-ignore
      offenderMessageId: this.ctxIntruder.message_id,
      // @ts-ignore
      offenderMessageContent: this.ctxIntruder.text,
      chatId: this.ctxBot.chat.id,
      botMessageId: this.ctxBot.message_id,
      botMessageIDAdminChat,
      reason
    })
  }

  public async muteText (botMessageIDAdminChat: number | undefined, reason: string, seconds: number) {
    this.saveToDB(botMessageIDAdminChat, reason)
    bot.telegram.restrictChatMember(this.ctxIntruder.chat.id, this.ctxIntruder.from.id, {
      permissions: {
        can_send_messages: false,
        can_change_info: false
      },
      until_date: seconds < 30 ? undefined : Math.floor(Date.now() / 1000) + seconds
    })
  }

  public report (reason: string, ms: number, warn?: boolean) {
    if (!ConfigManager.data.adminChat) return
    const buttons = Markup.inlineKeyboard([
      warn ? [] : [Markup.button.callback('Удалить сообщение нарушителя', 'mute_delete_offending_message')],
      [Markup.button.callback('Снять блокировку', 'unmute')]
    ])

    // @ts-ignore
    const intruderContent = this.ctxIntruder.text

    // @ts-ignore
    const intruderMsgId = this.ctxIntruder.message_id

    const time = strftime('%d.%m.20%y %H:%M', new Date(Date.now() + ms))
    return bot.telegram.sendMessage(ConfigManager.data.adminChat,
      `<b>— Выдача мута (блокировки в чате).</b>
Нарушитель: ${generateHTMLUserHyperlink({ userId: this.ctxIntruder.from.id, username: this.ctxIntruder.from.username, firstName: this.ctxIntruder.from.first_name, lastName: this.ctxIntruder.from.last_name })}
Модератор: ${generateHTMLUserHyperlink({ userId: this.ctxModer.from.id, username: this.ctxModer.from.username, firstName: this.ctxModer.from.first_name, lastName: this.ctxModer.from.last_name })}
Причина: <code>${adaptTextToHTML(reason)}</code>

<b>— Дополнительная информация.</b>
На какое время?: <code>${ms < 30000 ? 'На Infinity.' : `На ${duration(ms)}`}</code>
До какого числа?: <code>${ms < 30000 ? 'До 99.99.9999' : `До ${time} по МСК`}</code>
Ссылка на сообщение нарушителя: <a href="${generateLinkToPost({ chatId: this.ctxIntruder.chat.id, chatName: this.ctxIntruder.chat.username, messageId: this.ctxIntruder.message_id })}">${intruderMsgId}</a>
Ссылка на сообщение с выдачей мута: <a href="${generateLinkToPost({ chatId: this.ctxBot.chat.id, chatName: this.ctxBot.chat.username, messageId: this.ctxBot.message_id })}">${this.ctxBot.message_id}</a>
Сообщение нарушителя: ${!intruderContent ? '<i>Нет текста.</i>' : `<code>${adaptTextToHTML(intruderContent)}</code>`}`, { parse_mode: 'HTML', ...buttons })
      .catch((err) => logManager.error('Mute_Manager', 'Не удалось отправить сообщение в чат администрации', err.stack))
  }
}

export default MuteManager
