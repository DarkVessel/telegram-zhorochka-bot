import CommandManager from '../src/classes/CommandManager'

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
        throw Error(`Путь должен равняться: test/.test_commands/\nУ вас путь: ${cmdManager.commandsPath}`)
      }
    })
  })

  describe('#addCommand', function () {
    it('Инициализация команды', function () {
      const cmdManager = new CommandManager('test/.test_commands/')
      cmdManager.addCommand('../../test/.test_commands/test_cmd.js')

      const cmd = cmdManager.commands.get('test')
      if (!cmd) throw Error('Команда не загружена в коллекцию.')
      if (!cmd.name) throw Error('У команды отсутствует название.')
      if (!cmd.run) throw Error('У команды отсутствует функция run')
    })
  })
})
