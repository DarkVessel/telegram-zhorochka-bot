import { Bot, BotConfig, Context } from 'grammy'

// Инициализация классов для взаимодействия с командами, ивентами и конфигом.
import CommandManager from './CommandManager'
import EventsManager from './EventsManager'

// Создаём класс, который наследуется от grammY.
// Наследованный класс легко расширять своими функциями.
class TelegramClient extends Bot {
  public constructor (token: string, options?: BotConfig<Context> | undefined) {
    // Передаём токен и опции Телеграфу.
    super(token, options)

    // При Ctrl + C или других сигналах, бот будет отключатся от Телеграмма.
    process.once('SIGINT', () => this.stop())
    process.once('SIGTERM', () => this.stop())
  }

  /**
   * Функция, которая запускает все обработчики.
   */
  public async startHandlers () {
    const commandManager = new CommandManager('build/src/commands/')
    const eventsManager = new EventsManager('build/src/events/')

    commandManager.start()

    // Загружаем команды в клиент.
    commandManager.commands.forEach((value) => {
      // bot.command обрабатывает /команды
      this.command(value.name, async (ctx) => CommandManager.commandCallHandler(value, ctx))
    })
    eventsManager.start()
  }
}

export default TelegramClient
