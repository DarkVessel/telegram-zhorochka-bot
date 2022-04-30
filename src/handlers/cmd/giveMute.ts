import { Context } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'
import MuteManager from '../../classes/MuteManager'

import adaptTextToHTML from '../../utils/adaptTextToHTML'
import duration from '../../utils/duration'
import generateHTMLUserHyperlink from '../../utils/generateHTMLUserHyperlink'

import Extra from '../../interfaces/CMD_ExtraGiveMute'
async function addWarn (reason: string, ctxIntruder: Context<Update>, ctxModer: Context<Update>, extra: Extra): Promise<void> {
  if (!extra.msgBot) {
    extra.msgBot = await ctxModer.reply('_Готовлю скотч..._', {
      parse_mode: 'Markdown',
      // @ts-ignore
      reply_to_message_id: ctxIntruder.message_id,
      allow_sending_without_reply: true
    })
  }
  if (!extra.offenderHyperlink) {
    extra.offenderHyperlink = generateHTMLUserHyperlink({
      username: ctxIntruder.from?.username,
      userId: ctxIntruder.from?.id,
      firstName: ctxIntruder.from?.first_name,
      lastName: ctxIntruder.from?.last_name
    })
  }

  if (!extra.moderatorHyperlink) {
    extra.moderatorHyperlink = generateHTMLUserHyperlink({
      username: ctxModer.from?.username,
      userId: ctxModer.from?.id,
      firstName: ctxModer.from?.first_name,
      lastName: ctxModer.from?.last_name
    })
  }

  const { msgBot, offenderHyperlink, moderatorHyperlink, summa } = extra

  const seconds = summa / 1000
  const muteManager = new MuteManager(ctxModer, ctxIntruder, msgBot)
  const msgAdminChat = await muteManager.report(reason, seconds * 1000)
  // @ts-ignore
  await muteManager.muteText(msgAdminChat.message_id, reason, seconds)
  ctxModer.telegram.editMessageText(msgBot.chat.id, msgBot.message_id, undefined,
    `<b>${seconds < 60
      ? `Пользователь ${offenderHyperlink} больше никогда не сможет писать в чат.`
      : `Пользователь ${offenderHyperlink} получил блокировку в чате на ${duration(summa)}`}</b>

<b>Модератор:</b> ${moderatorHyperlink}
<b>Причина:</b> <code>${adaptTextToHTML(reason)}</code>`,
    { parse_mode: 'HTML' })
}

export default addWarn
