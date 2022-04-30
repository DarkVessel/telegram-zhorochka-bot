import ConfigManager from '../../src/classes/ConfigManager'
import configSchema from '../../src/configSchema'
import colorTheText from './utils/colorTheText'
import input from './utils/input'

const configManager = new ConfigManager()
module.exports = async () => {
  // Обновляем информацию о конфиге.
  await configManager.start()

  console.log(colorTheText('yellow', `Настроим config.json!
Для пропуска ненужных настроек, напишите skip, тогда применится дефолтное значение.`))

  // Изменяемая переменная, равняется true если в базу данных нужно что-то записать.
  let saveToDB = false
  const keys = Object.keys(configSchema)
  // Проходимся по всем ключам в конфиге
  for (let i = 0; i < keys.length; i++) {
    console.log()
    const key = keys[i]
    if (ConfigManager.data[key]) {
      console.log(colorTheText('green', `✔ Ключ ${key} присутствует в конфигурации.`))
    }

    saveToDB = true

    const data = configSchema[key]
    console.log(`Настройка ${colorTheText('blue', `[${key}]`)}`)
    console.log(`Тип: ${colorTheText('blue', `${data.type}`)}`)
    console.log(`По дефолту: ${colorTheText('blue', `${data.default}`)}`)
    console.log(`Описание: ${colorTheText('blue', `${data.description}`)}`)
    console.log(`Ваше значение установлено: ${colorTheText('blue', `${ConfigManager.data[key] ?? 'Не установлено.'}`)}`)

    const value = await input(colorTheText('yellow', '>>> Укажите новое значение или skip чтобы оставить старое: '))
    if (value === 'skip') {
      // Проверяем, есть ли значение по такому ключу в ConfigManager
      if ((ConfigManager.data[key] ?? false) === false) continue

      // Присваиваем иначе дефолтное значение
      ConfigManager.data[key] = data.default
    } else {
      // Если нужно указать число и значение не является числом.
      if (data.type === 'number' && isNaN(Number(value))) {
        console.log(colorTheText('red', '>>> Нужно указать число!'))
        i--
        continue
      }
      ConfigManager.data[key] = value
    }
    console.log(colorTheText('green', 'Установлено значение: ' + ConfigManager.data[key]))
  }

  if (!saveToDB) {
    console.log(`>>> ${colorTheText('green', 'Настройка не требуется!')}`)
    return
  }
  console.log()
  console.log(colorTheText('yellow', 'Записываю данные в MySQL...'))
  await configManager.save() // Сохраняем изменения.
  console.log(colorTheText('green', JSON.stringify(ConfigManager.data, null, 4)))
}
