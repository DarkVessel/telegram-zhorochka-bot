import { Update } from 'telegraf/typings/core/types/typegram'
import { Context, Telegraf } from 'telegraf'

import CommandManager from './CommandManager'
import EventsManager from './EventsManager'
import ConfigManager from './ConfigManager'

class TelegramClient extends Telegraf {
  public constructor (token: string, options?: Partial<Telegraf.Options<Context<Update>>> | undefined) {
    super(token, options)

    process.once('SIGINT', () => this.stop('SIGINT'))
    process.once('SIGTERM', () => this.stop('SIGTERM'))
  }

  public startHandlers () {
    const commangManager = new CommandManager('build/commands/')
    const eventsManager = new EventsManager('build/events/')
    const configManager = new ConfigManager('./src/config.json')

    configManager.start()
    commangManager.start()
    eventsManager.start()

    // Загружаем команды в клиент.
    commangManager.commands.forEach((value) => {
      this.command(value.name, value.run)
    })
  }
}

export default TelegramClient
