import { Context } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'
import WarnManager from '../../classes/WarnManager'

import adaptTextToHTML from '../../utils/adaptTextToHTML'
import MuteManager from '../../classes/MuteManager'
import duration from '../../utils/duration'
import warnMuteForever from '../../content/cmd_warn/mute_forever'
import warnMute from '../../content/cmd_warn/mute'
import uts from '../../utils/uts'
import generateHTMLUserHyperlink from '../../utils/generateHTMLUserHyperlink'
import getRandomElement from '../../utils/getRandomElement'

import Extra from '../../interfaces/CMD_ExtraAddWarn'
async function addWarn (reason: string, ctxIntruder: Context<Update>, ctxModer: Context<Update>, extra: Extra = {}): Promise<void> {
  if (!('userAdmin' in extra)) {
    const chatAdministrators = await ctxModer.getChatAdministrators()
    extra.userAdmin = chatAdministrators.find(c => c.user.id === ctxIntruder.from?.id)
  }

  if (!extra.msgBot) {
    extra.msgBot = await ctxModer.reply('_Завожу личное дело на этого гражданина..._', {
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

  if (!('warnsLength' in extra)) {
    const warns = await WarnManager.fetchUser(Number(ctxIntruder.from?.id), <number>ctxIntruder.chat?.id)
    warns.length += 1
    extra.warnsLength = warns.length
  }

  const { userAdmin, msgBot, warnsLength, offenderHyperlink, moderatorHyperlink } = extra
  const warnManager = new WarnManager(ctxModer, ctxIntruder, msgBot)

  const msgAdminChat = await warnManager.report(reason, <number>warnsLength)
  await warnManager.add(msgAdminChat?.message_id, reason)
  ctxModer.telegram.editMessageText(msgBot.chat.id, msgBot.message_id, undefined,
    `Пользователь ${offenderHyperlink} получил ${warnsLength} предупреждение.

<b>Модератор:</b> ${moderatorHyperlink}
<b>Причина:</b> <code>${adaptTextToHTML(reason)}</code>`,
    { parse_mode: 'HTML' })

  if (userAdmin) return
  if (warnsLength === 3 || warnsLength === 6 || <number>warnsLength === 10) {
    const seconds = (warnsLength === 3 ? (60 * 60) : ((warnsLength === 10) ? 0 : 60 * 60 * 24))
    const strMsgBot = getRandomElement(warnsLength === 10 ? warnMuteForever : warnMute)
      .replace('{user}', offenderHyperlink)
      .replace('{time}', duration(seconds * 1000))

    if (warnsLength === 10) warnManager.clear()
    const muteMsg = await ctxModer.reply('_Подождите, подготавливаю скотч..._', {
      parse_mode: 'Markdown',
      reply_to_message_id: msgBot.message_id,
      allow_sending_without_reply: true
    })

    const reason = `Получил ${uts(<number>warnsLength, ['предупреждение', 'предупреждения', 'предупреждений'])}`
    const muteManager = new MuteManager(msgBot, ctxIntruder, muteMsg)
    const msgAdminChat = await muteManager.report(reason, seconds * 1000, true)
    await muteManager.muteText(msgAdminChat?.message_id, reason, seconds)
    ctxModer.telegram.editMessageText(muteMsg.chat.id, muteMsg.message_id, undefined, strMsgBot, { parse_mode: 'Markdown' })
  }
}

export default addWarn
