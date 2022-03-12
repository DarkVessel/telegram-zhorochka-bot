import CommandManager from '../src/classes/CommandManager'

process.env.MOCHA_WORKING = 'true'
describe('CommandManager.ts', function () {
  describe('#constructor', function () {
    it('Инициализация', function () {
      // eslint-disable-next-line no-new
      new CommandManager('test/.test_commands')
    })

    it('Преднамеренная ошибка', function () {
      const randomNumber = String(Math.random())
      try {
        // eslint-disable-next-line no-new
        new CommandManager('test/123456789')
        throw Error(randomNumber)
      } catch (err) {
        if (err.message === randomNumber) throw Error('Класс не выдал throw исключение.')
      }
    })

    it('Правильно ли ставит на конце пути "/"?', function () {
      const cmdManager = new CommandManager('test/.test_commands')
      if (cmdManager.commandsPath !== 'test/.test_commands/') {
        throw Error(`Путь должен равняться: test/.test_commands/
У вас путь: ${cmdManager.commandsPath}`)
      }
    })
  })

  describe('#addCommand', function () {
    const cmdManager = new CommandManager('test/.test_commands/')
    it('Инициализация команды', function () {
      cmdManager.addCommand('../../test/.test_commands/test_cmd.js')

      const cmd = cmdManager.commands.get('test')
      if (!cmd) throw Error('Команда не загружена в коллекцию.')
      if (!cmd.name) throw Error('У команды отсутствует название.')
      if (!cmd.run) throw Error('У команды отсутствует функция run')
    })

    it('Инициализация команды с ошибкой', function () {
      const path = '../../test/.test_commands/test_cmd_error.js'
      cmdManager.addCommand(path)

      if (!cmdManager.unloadedCommands.find(obj => obj.path === path)) {
        throw Error('Команда не добавилась в массив unloadedCommands')
      }
    })

    it('Инициализация команды с дубликатом', function () {
      if (!cmdManager.commands.has('test')) {
        throw Error('Не пройден этап инициализации команды')
      }

      const path = '../../test/.test_commands/test_cmd.js'
      cmdManager.addCommand(path)
      if (!cmdManager.unloadedCommands.find(obj => obj.path === path)) {
        throw Error('Команда не добавилась в массив unloadedCommands')
      }
    })
  })

  describe('#start (#loadCommands)', function () {
    it('Проверка на правильную загрузку команд.', function () {
      const cmdManager = new CommandManager('test/.test_commands/')
      cmdManager.start()

      if (!cmdManager.commands.has('test')) {
        throw Error('Команда .test_commands/test_cmd.js не загружена!')
      }

      if (!cmdManager.commands.has('test2')) {
        throw Error('Команда .test_commands/test_folder/test_cmd.js не загружена!')
      }

      const path1 = '../../test/.test_commands/test_folder/test_cmd_error.js'
      if (!cmdManager.unloadedCommands.find((obj) => obj.path === path1)) {
        throw Error(`Нерабочая команда по пути "${path1}" не помечена в unloadedCommands`)
      }

      const path2 = '../../test/.test_commands/test_cmd_error.js'
      if (!cmdManager.unloadedCommands.find((obj) => obj.path === path2)) {
        throw Error(`Нерабочая команда по пути "${path2}" не помечена в unloadedCommands`)
      }
    })
  })
})
