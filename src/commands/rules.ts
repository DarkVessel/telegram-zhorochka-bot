import ConfigManager from '../classes/ConfigManager'
import Command from '../handlers/Command'
class Rules extends Command {
  constructor () {
    super({
      name: 'rules',
      run (ctx) {
        if (!ConfigManager.data.rules_fromChatId) {
          return ctx.reply(
            'Отсутствует rules_fromChatId в config.json. Обратитесь к Администраторам.'
          )
        }
        if (!ConfigManager.data.rules_messageId) {
          return ctx.reply(
            'Отсутствует rules_messageId в config.json. Обратитесь к Администраторам.'
          )
        }
        if (ctx.chat?.id === undefined) {
          return ctx.reply(
            'Не найден chat.id этого чата. Повторите попытку позже.'
          )
        }

        ctx.reply('Ознакомиться с правилами можно [здесь](https://t.me/crazy_linux/249).', { parse_mode: 'Markdown' })
        // bot.telegram
        //   .copyMessage(ctx.chat.id, ConfigManager.data.rules_fromChatId, ConfigManager.data.rules_messageId)
        //   .catch((err) => {
        //     ctx
        //       .reply(
        //         "Не удалось отправить правила. Ошибка уже отправлена Администраторам."
        //       )
        //       .catch(console.error);

        //    logmanager.error(
        //       "COMMANDS",
        //       "В команде /rules произошла ошибка при попытке скопировать сообщение.",
        //       err.stack,
        //       [`chatId: ${ctx.chat?.id}\nfromChatId: ${ConfigManager.data.rules_fromChatId}\nmessageId: ${ConfigManager.data.rules_messageId}`]
        //     );
        //   });
      }
    })
  }
}
export = Rules;
