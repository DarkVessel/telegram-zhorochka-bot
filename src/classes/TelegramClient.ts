// Update и Context - Это описание типов.
// Telegraf - модуль для работы с Телеграммом.
import { Update } from 'telegraf/typings/core/types/typegram'
import { Context, Telegraf } from 'telegraf'

// Инициализация классов для взаимодействия с командами, ивентами и конфигом.
import CommandManager from './CommandManager'
import EventsManager from './EventsManager'
import ConfigManager from './ConfigManager'

// Создаём класс, который наследуется от Telegraf.
// Наследованный класс легко расширять своими функциями.
class TelegramClient extends Telegraf {
  public constructor (token: string, options?: Partial<Telegraf.Options<Context<Update>>> | undefined) {
    // Передаём токен и опции Телеграфу.
    super(token, options)

    // При Ctrl + C или других сигналах, бот будет отключатся от Телеграмма.
    process.once('SIGINT', () => this.stop('SIGINT'))
    process.once('SIGTERM', () => this.stop('SIGTERM'))
  }

  /**
   * Функция, которая запускает все обработчики.
   */
  public async startHandlers () {
    const commandManager = new CommandManager('build/src/commands/')
    const eventsManager = new EventsManager('build/src/events/')
    const configManager = new ConfigManager()

    await configManager.start()
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
