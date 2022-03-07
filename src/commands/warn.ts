import { existsSync, writeFileSync } from 'fs'
import ConfigManager from '../classes/ConfigManager'
import Command from '../handlers/Command'
import bot from '../telegramClient'

if (!existsSync('./src/warns.json')) writeFileSync('./src/warns.json', '{}')
const warns = require('../../src/warns.json')
class WarnCommand extends Command {
  constructor () {
    super({
      name: 'warn',
      async run (ctx) {
        // 1.1. Проверка на наличие chat_id в config.json.
        if (!ConfigManager.data.chat_id) {
          return ctx.reply('К сожалению, команды модерации не могут работать из-за отсутствия ключа `chat_id` в `config.json`',
            { parse_mode: 'Markdown' })
        }

        // 1.2. Проверка на то, что команда выполняется на нужном сервере.
        if (ConfigManager.data.chat_id !== ctx.message?.chat.id) { return ctx.reply('В этой группе нельзя использовать команды модерации.') }

        // 2. Проверка на присутствие прав у бота..
        const chatAdministrators = await ctx.getChatAdministrators()
        if (!chatAdministrators.find(c => c.user.id === bot.botInfo?.id)) { return ctx.reply('Я не нашёл себя в списках Администратора. Эй!? Что за измена?!') }

        // 3. Проверка на то, что юзер является админом.
        if (!chatAdministrators.find(c => c.user.id === ctx.message?.from.id)) { return ctx.reply('Ой, ты не админ...извини, я не могу позволить тебе использовать эту команду.') }

        // 4. Находим id пользователя, которого нужно замутить..
        // @ts-ignore
        const message = ctx.update.message.reply_to_message
        if (!message) return ctx.reply('Эй, а кому давать варн? Ответь на сообщение нарушителя.')

        // 5. Проверка на самовыпилевание или на указание на бота.
        if (message.from.id === bot.botInfo?.id) { return ctx.reply('Что? Меня за что?') }

        if (message.from.id === ctx.message.from.id) { return ctx.reply('Самокритично, однако. Но я не позволю.') }

        // 6. Проверка на то, чтобы юзером не был Админ.
        const userAdmin = chatAdministrators.find(c => c.user.id === message.from.id)
        if (userAdmin && chatAdministrators.find((c) => c.status === 'creator')?.user.id !== ctx.message.from.id) { return ctx.reply('Только глава может давать варны Администраторам!') }

        if (!warns[message.from.id]) warns[message.from.id] = []
        warns[message.from.id].push({
          moderator: ctx.message?.from.id,
          date: Date.now(),
          message_id: message.message_id
        })

        writeFileSync('./src/warns.json', JSON.stringify(warns, null, 4))

        ctx.reply(`*Пользователю @${message.from.username} было выдано ${warns[message.from.id].length} предупреждение.*`, { parse_mode: 'Markdown' })

        if (userAdmin) return
        const warnsLength = warns[message.from.id].length
        if (warnsLength === 3 || warnsLength === 6) {
          ctx.restrictChatMember(message.from.id, {
            permissions: {
              can_send_messages: false,
              can_change_info: false
            },
            until_date: Math.floor(Date.now() / 1000) + (warnsLength === 3 ? (60 * 60) : (60 * 60 * 24))
          }).then(() => {
            ctx.reply(`*Пользователь @${message.from.username} больше не может писать в чат.*`, { parse_mode: 'Markdown' })
          }).catch(console.error)
        } else if (warnsLength >= 10) {
          ctx.banChatMember(message.from.id).then(() => {
            ctx.reply(`*Пользователь @${message.from.username} был забанен...навсегда.*`, { parse_mode: 'Markdown' })
          }).catch(console.error)
        }

        // const args: Array<string> = ctx.message.text
        //   .slice(6) // Вырезаем /warn
        //   .trim() // Удаляем пробелы по бокам.
        //   .split(" "); // Разделяем.

        // // Если указан первый аргумент.
        // if (args[0]) {
        //   const username = args[0].slice(args[0][0] === "@" ? 1 : 0);

        // }
      }
    })
  }
}
export = WarnCommand;
