import { Markup } from 'telegraf'
import Command from '../handlers/Command'
class TestCommand extends Command {
  constructor () {
    super({
      allowUseInDM: false,
      checkMeAdmin: false,
      checkAdmin: false,
      checkOwner: true,
      name: 'test',
      async run (ctx) {
        const arr: any = [[], [], []]
        for (let i = 0; i < 4; i++) arr[0].push(Markup.button.callback(String(i + 1), String(i)))
        for (let i = 4; i < 8; i++) arr[1].push(Markup.button.callback(String(i + 1), String(i)))
        for (let i = 8; i < 9; i++) arr[2].push(Markup.button.callback(String(i + 1), String(i)))
        ctx.reply('Какой варн снять?', {
          parse_mode: 'HTML',
          reply_to_message_id: ctx.message?.message_id,
          ...Markup.inlineKeyboard(arr)
        })
      }
    })
  }
}
export default TestCommand
