import { Bot } from 'grammy'
import LogManager from './LogManager'

// Композиции.
import { Commands } from '../commands/index'
import { Events } from '../events'

// Схема команд.
import commandScheme from '../scheme/commandsScheme'
const logManager = new LogManager('./src/classes/TelegramClient.ts')
// Создаём класс, который наследуется от grammY.
class TelegramClient extends Bot {
  /** Время, когда был запущен бот (подключился к сети) */
  public initTime: number | undefined

  /** Запуск бота. */
  public async login () {
    this.catch((err) => {
      logManager.error('CLIENT', 'Была перехвачена какая-то ошибка!', err.stack)
    })
    this._loadComposers()
    this.updateCommandInformation()
    this.start()
    this.initTime = Date.now()
    logManager.log('CLIENT', 'Login!')
  }

  /** Загрузить композиторы. */
  private _loadComposers () {
    this.use(Commands)
    this.use(Events)
  }

  /** Обновляет информацию о командах (подсказки при вводе команды) */
  public async updateCommandInformation () {
    logManager.log('CLIENT', 'Обновляю информацию о командах...')
    const commands = commandScheme
      .filter(c => c.show)
      .map(c => ({ command: c.name, description: c.shortDescription }))

    await this.api.setMyCommands(commands)
    logManager.log('CLIENT', 'Информация о командах обновлена!')
  }
}

export default TelegramClient
