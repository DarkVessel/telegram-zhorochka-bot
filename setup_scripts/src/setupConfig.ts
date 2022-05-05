import ConfigManager from '../../src/classes/ConfigManager'
import configSchema from '../../src/scheme/configScheme'
import ConfigKeys from '../../src/interfaces/ConfigKeys'

import colorTheText from './utils/colorTheText'
import input from './utils/input'

const configManager = new ConfigManager()
module.exports = async () => {
  console.log(colorTheText('yellow', 'Подождите, подключаюсь к базе данных...'))
  // Обновляем информацию о конфиге.
  await configManager.start()
  // Отключить логи от LogManager.
  process.env.DISABLE_LOGGING = 'true'

  console.clear()
  console.log(colorTheText('yellow', `Настроим config.json!
Для пропуска ненужных настроек просто ничего не пишите, тогда применится значение по-умолчанию или то, которое у вас уже стоит.`))

  // Изменяемая переменная, равняется true если в базу данных нужно что-то записать.
  let saveToDB = false
  const keys = Object.keys(configSchema)
  // Проходимся по всем ключам в конфиге
  for (let i = 0; i < keys.length; i++) {
    console.log()
    const key = <keyof ConfigKeys>keys[i]

    saveToDB = true

    const data = configSchema[key]
    console.log(`Настройка ${colorTheText('blue', `[${key}]`)}`)
    console.log(`Тип: ${colorTheText('blue', `${data.type}`)}`)
    console.log(`По умолчанию: ${colorTheText('blue', `${data.default}`)}`)
    console.log(`Описание: ${colorTheText('blue', `${data.description}`)}`)
    if (ConfigManager.data[key]) console.log(`Ваше значение установлено: ${colorTheText('blue', String(ConfigManager.data[key]))}`)

    const value = await input(colorTheText('yellow', '>>> Укажите новое значение или просто нажмите Enter чтобы оставить всё как есть: '))
    if (!value) {
      // Проверяем, есть ли значение по такому ключу в ConfigManager
      if ((ConfigManager.data[key] ?? false) === false) continue

      // Присваиваем иначе дефолтное значение
      ConfigManager.data[key] = <undefined>data.default
    } else {
      // Если нужно указать число и значение не является числом.
      if (data.type === 'number' && isNaN(Number(value))) {
        console.log(colorTheText('red', '>>> Нужно указать число!'))
        i--
        continue
      }
      // @ts-ignore
      ConfigManager.data[key] = <undefined>value
    }
    if (ConfigManager.data[key]) console.log(colorTheText('green', 'Установлено значение: ' + ConfigManager.data[key]))
  }

  if (!saveToDB) {
    console.log(`>>> ${colorTheText('green', 'Нечего сохранять.')}`)
    return
  }
  console.log()
  console.log(colorTheText('yellow', 'Записываю данные в MySQL...'))
  await configManager.save() // Сохраняем изменения.
  console.log(colorTheText('green', JSON.stringify(ConfigManager.data, null, 4)))
}
