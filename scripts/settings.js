const { writeFileSync } = require('fs')

const readline = require('readline')
function input (question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question(question, answer => {
      rl.close()
      resolve(answer)
    })
  })
}

const checksForTypes = {
  number: (n) => !isNaN(n) ? Number(n) : undefined,
  boolean: (b) => {
    if (typeof b === 'boolean') return b
    if (b.toLowerCase() === 'true') return true
    else if (b.toLowerCase() === 'false') return false
  }
}

/**
 * Возвращает true если ответ положительный и false если отрицательный.
 * @param { string } d
 * @returns
 */
const yesAndNo = (d) => ['y', 'у', 'yes', 'д', 'да'].includes(d.toLowerCase())

const colors = {
  red: 1,
  yellow: 3,
  blue: 6,
  green: 40
}
const colorTheText = (color, text) => `\x1B[38;5;${colors[color] ?? 8}m\x1B[1m${text}\x1B[22m\x1B[39m`
console.log(colorTheText('yellow', '\nДобро пожаловать в настройки!'))
input(colorTheText('yellow', '>>> Вы хотите начать? [Y/n]: ')).then(async (d) => {
  if (!yesAndNo(d)) {
    console.log('Ваш ответ мы воспринимаем как "нет"')
    console.log('Если передумали - пропишите npm run settings для повторного запуска настройки.')
    return
  }

  // Запись токена в .env
  console.log(colorTheText('yellow', '>>> Укажите токен вашего Телеграм бота:'))
  const token = await input('BOT_TOKEN=')
  writeFileSync('.env', 'BOT_TOKEN=' + token.trim())
  console.log(colorTheText('green', 'Токен записан в .env файл.'))

  // Вопросы о конфиге.
  const config = {} // Конфиг, который мы запишем в файл.
  const configSchema = require('../build/configSchema.js').default // Схема.

  console.log(colorTheText('yellow', '\nНастроим config.json!\nДля пропуска ненужных настроек, напишите skip, тогда применится дефолтное значение.'))
  const keys = Object.keys(configSchema)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]

    const data = configSchema[key]
    console.log(`\nНастройка ${colorTheText('blue', `[${key}]`)}`)
    console.log(`Тип: ${colorTheText('blue', `${data.type}`)}`)
    console.log(`По дефолту: ${colorTheText('blue', `${data.default}`)}`)
    console.log(`Описание: ${colorTheText('blue', `${data.description}`)}`)

    const data2 = await input(colorTheText('yellow', '>>> Укажите значение или skip: '))
    if (data2 === 'skip') config[key] = data.default
    else {
      if (!checksForTypes[data.type]) {
        config[key] = data2
        continue
      }
      const info = checksForTypes[data.type](data2)
      if (!info) {
        console.log(colorTheText('red', 'Неправильный тип данных! Попробуйте ещё раз.'))
        i--
        continue
      } else config[key] = info
    }

    console.log(colorTheText('green', 'Установлено значение: ' + config[key]))
  }

  const stringObj = JSON.stringify(config, null, 4)
  writeFileSync('./src/config.json', stringObj)
  console.log('\nЗаписан в config.json объект:')
  console.log(colorTheText('blue', stringObj))
  console.log(colorTheText('green', '\nНастройка завершена, можно запускать бота!'))
})
