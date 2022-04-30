import confirmationToMute from '../../content/cmd_mute/confirmation_to_mute'
import MuteCommand from '../../commands/mute'
import giveWarn from '../cmd/giveMute'

const agreement = confirmationToMute.map(arr => arr[0])
const refusal = confirmationToMute.map(arr => arr[1])

const runningKeyboards = MuteCommand.runningKeyboards

export default (ctx) => {
  const replyMessage = ctx.update.message.reply_to_message
  if (!replyMessage) return

  const keyboard = runningKeyboards.get(replyMessage.message_id)
  if (!keyboard) return
  if (keyboard?.userId !== ctx.from.id) return

  const agreementInclude = agreement.includes(ctx.message.text)
  const refusalInclude = refusal.includes(ctx.message.text)

  if (agreementInclude || refusalInclude) {
    clearTimeout(keyboard.timeout)
    ctx.deleteMessage(keyboard.ctxModer.message?.message_id)
    ctx.deleteMessage(replyMessage.message_id)
    ctx.deleteMessage(ctx.message.message_id)
  }

  if (agreementInclude) giveWarn(keyboard.reason, keyboard.ctxIntruder, keyboard.ctxModer, keyboard.extra)
}
