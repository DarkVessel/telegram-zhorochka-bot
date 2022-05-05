import CommandScheme from '../interfaces/CommandScheme'

const scheme: CommandScheme = {
  Developer_Tools: {
    eval: {
      show: false,
      shortDescription: 'Выполнить JavaScript-код.',
      description: 'Выполняет JavaScript код через функцию eval(). Очень аккуратно пользоваться! Доступна только создателю.',
      examples: [
        '/{comamndName} ctx.reply("Hi!")',
        '/{commandName} 5 + 5'
      ]
    },
    test: {
      show: false,
      shortDescription: 'Тестовая команда. Что она делает?....',
      description: 'Данная команда доступна исключительно создателю бота, выполняется неизвестный скрипт, как правило тестовый.'
    },
    src: {
      show: false,
      shortDescription: 'Вывести Context этого сообщения.',
      description: 'Позволяет узнать больше информации о сообщении в виде объекта.'
    }
  },
  Basic: {
    rules: {
      show: true,
      shortDescription: 'Узнать правила.',
      description: 'Отправляет в чат правила или ссылку на них.'
    }
  }
}

export default scheme
