import confirmationToWarn from '../../content/cmd_warn/confirmation_to_warn'
import WarnCommand from '../../commands/warn'
import bot from '../../telegramClient'
import addWarn from '../cmd/addWarn'
import mute from './muteConsentOrRefusal'

const agreement = confirmationToWarn.map(arr => arr[0])
const refusal = confirmationToWarn.map(arr => arr[1])

const runningKeyboards = WarnCommand.runningKeyboards
bot.on('text', async (ctx) => {
  mute(ctx)
  const replyMessage = ctx.update.message.reply_to_message
  if (!replyMessage) return

  const keyboard = runningKeyboards.get(replyMessage.message_id)
  if (keyboard?.userId !== ctx.from.id) return

  const agreementInclude = agreement.includes(ctx.message.text)
  const refusalInclude = refusal.includes(ctx.message.text)

  if (agreementInclude || refusalInclude) {
    clearTimeout(keyboard.timeout)
    ctx.deleteMessage(keyboard.ctxModer.message?.message_id)
    ctx.deleteMessage(replyMessage.message_id)
    ctx.deleteMessage(ctx.message.message_id)
  }

  if (agreementInclude) addWarn(keyboard.reason, keyboard.ctxIntruder, keyboard.ctxModer, keyboard.extra)
})
