import Command from '../handlers/Command'
class Test extends Command {
  constructor () {
    super({
      name: 'test',
      async run (ctx) {
        // @ts-ignore
        const chatAdministrators = await ctx.getChatAdministrators()
        console.log(chatAdministrators)
        // ctx.restrictChatMember(message.from.id, { permissions: {
        //   can_send_messages: false,
        //   can_change_info: false,
        // }, until_date: Math.floor(Date.now() / 1000) + 60 });

        // ctx.banChatMember(message.from.id, Math.floor(Date.now() / 1000) + 60)
      }
    })
  }
}
export = Test;
