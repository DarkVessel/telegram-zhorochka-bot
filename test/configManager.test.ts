import { existsSync, readFileSync, rmSync, writeFileSync } from 'fs'
import ConfigManager from '../src/classes/ConfigManager'
import configSchema from '../src/configSchema'

process.env.MOCHA_WORKING = 'true'
function initializeTheConfigManager () {
  const fileName = `test_file_${Math.random()}.json`
  const configManager = new ConfigManager(fileName)
  configManager.start()

  return { fileName, configManager }
}

describe('ConfigManager.ts', function () {
  describe('#constructor', function () {
    it('Инициализация класса', function () {
      // eslint-disable-next-line no-new
      new ConfigManager(`./test_file_${Math.random()}.json`)
    })

    it('Запуск с отсутствующим конфиг-файлом', function () {
      const { fileName } = initializeTheConfigManager()

      if (!existsSync(fileName)) throw Error('Конфиг-файл не создался.')
      else rmSync(fileName)
    })
  })

  describe('#overwrite', function () {
    it('Перезапись файла', function () {
      const { configManager, fileName } = initializeTheConfigManager()
      ConfigManager.data.chat_id = 0
      configManager.overwrite()

      const fileContent = readFileSync(fileName).toString()
      const JSONstr = JSON.stringify(ConfigManager.data, null, 4)
      if (JSONstr !== fileContent) {
        throw Error(`Файл неправильно перезаписался.
     Запись:
${fileContent}

     Должно быть:
${JSONstr}`)
      }
      rmSync(fileName)
    })

    it('Перезапись отсутствующего файла', function () {
      const configManager = new ConfigManager(`test_file_${Math.random()}.json`)

      process.env.MOCHA_WORKING = undefined
      configManager.overwrite()
      process.env.MOCHA_WORKING = 'true'

      if (!existsSync(configManager.path)) {
        throw Error('Новый файл конфигурации не создался.')
      } else rmSync(configManager.path)
    })
  })

  describe('#reread', function () {
    it('Перечитать файл', function () {
      const { fileName, configManager } = initializeTheConfigManager()
      writeFileSync(fileName, '{"test_key": 999}')
      configManager.reread()
      rmSync(fileName)

      // @ts-ignore
      if (ConfigManager.data.test_key !== 999) throw Error('Файл не перечитался.')
    })

    it('Перечитать отсутствующий файл', function () {
      const fileName = `test_file_${Math.random()}.json`
      const configManager = new ConfigManager(fileName)

      configManager.reread()
      if (!existsSync(configManager.path)) {
        throw Error('Новый файл конфигурации не создался.')
      } else rmSync(configManager.path)
    })
  })

  describe('#returnDefaultConfig', function () {
    it('Работа функции', function () {
      const { configManager, fileName } = initializeTheConfigManager()
      configManager.returnDefaultConfig()
      rmSync(fileName)
    })
  })

  describe('#reset', function () {
    it('Перезапись файла', function () {
      const { configManager, fileName } = initializeTheConfigManager()
      writeFileSync(fileName, '...')
      configManager.reset()
      const fileContent = readFileSync(fileName).toString()
      rmSync(fileName)
      if (fileContent === '...') throw Error('Файл не перезаписался.')
    })
  })

  describe('#rereadSchema', function () {
    it('Сравнение файла до и после', function () {
      const { configManager, fileName } = initializeTheConfigManager()
      writeFileSync(fileName, '{}')
      ConfigManager.data = {}

      const keys = Object.keys(configSchema).filter(k => configSchema[k].default !== undefined)
      if (!keys.length) {
        console.warn('[WARN]: В configSchema нет дефолтных значений, проверка отменяется.')
        return
      }
      configManager.rereadSchema()
      const fileContent = readFileSync(fileName).toString()
      rmSync(fileName)

      const keysData = Object.keys(ConfigManager.data)
      if (!keysData.length) throw Error('Объект не изменился.')
      if (keysData.join(',') !== keys.join(',')) {
        throw Error(`Объект изменился неправильно.
Должно быть ${keys.length} ключей (${keys.join(', ')})

А в объекте ${keysData.length} ключей (${keysData.join(', ')})`)
      }

      const fileKeys = Object.keys(JSON.parse(fileContent))
      if (fileContent === '{}') throw Error('Файл не изменился.')
      if (fileKeys.join(',') !== keys.join(',')) {
        throw Error(`Файл перезаписался неправильно.
Должно быть ${keys.length} ключей (${keys.join(', ')})
      
А в файле ${fileKeys.length} ключей (${fileKeys.join(', ')})`)
      }
    })
  })
})
