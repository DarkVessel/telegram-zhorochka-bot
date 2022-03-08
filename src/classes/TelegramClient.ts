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
  public startHandlers () {
    const commangManager = new CommandManager('build/commands/')
    const eventsManager = new EventsManager('build/events/')
    const configManager = new ConfigManager('./src/config.json')

    configManager.start()
    commangManager.start()
    eventsManager.start()

    // Загружаем команды в клиент.
    commangManager.commands.forEach((value) => {
      // bot.command обрабатывает /команды
      this.command(value.name, value.run)
    })
  }
}

export default TelegramClient
