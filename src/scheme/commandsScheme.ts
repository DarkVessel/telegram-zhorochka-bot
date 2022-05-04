import CommandScheme from '../interfaces/CommandScheme'

const scheme: Array<CommandScheme> = [
  {
    name: 'eval',
    show: false,
    category: 'Developer_Tools',
    shortDescription: 'Выполнить JavaScript-код.',
    description: 'Выполняет JavaScript код через функцию eval(). Очень аккуратно пользоваться! Доступна только создателю.',
    examples: [
      '/{comamndName} ctx.reply("Hi!")',
      '/{commandName} 5 + 5'
    ]
  },
  {
    name: 'test',
    show: false,
    category: 'Developer_Tools',
    shortDescription: 'Тестовая команда. Что она делает?....',
    description: 'Данная команда доступна исключительно создателю бота, выполняется неизвестный скрипт, как правило тестовый.'
  }
]

export default scheme
