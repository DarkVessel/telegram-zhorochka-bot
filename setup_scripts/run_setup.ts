import colorTheText from './src/utils/colorTheText'
import input from './src/utils/input'

/**
 * Возвращает true если ответ положительный и false если отрицательный.
 * @param { string } d
 * @returns
 */
const yesAndNo = (d: string): boolean => ['y', 'у', 'yes', 'д', 'да'].includes(d.toLowerCase())

console.log(colorTheText('yellow', '\nДобро пожаловать в настройки!'))
input(colorTheText('yellow', '>>> Вы хотите начать? [Y/n]: ')).then(async (d) => {
  if (!yesAndNo(d)) {
    console.log('Ваш ответ мы воспринимаем как "нет"')
    console.log('Если передумали - пропишите npm run settings для повторного запуска настройки.')
    return
  }

  // Отключить логи от sequelize и LogManager.
  process.env.DISABLE_LOGGING_MYSQL = 'true'
  process.env.DISABLE_LOGGING = 'true'

  // Вызываем функцию для конфигурации .env файла.
  require('./src/setupEnv')()
  console.log()
  console.log(colorTheText('yellow', 'Подождите, идёт подключение к MySQL...'))
  require('./src/setupConfig')() // Функция для настройки конфига.
})
