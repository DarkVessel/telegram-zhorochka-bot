import { existsSync, readFileSync, rmSync, writeFileSync } from 'fs'
import ConfigManager from '../src/classes/ConfigManager'

import configSchema from '../configSchema'
function returnDefaultConfig() {
  const config = {}
  for (const key in configSchema) {
    if (!Object.prototype.hasOwnProperty.call(configSchema, key)) continue
    config[key] = configSchema[key].default
  }

  return config
}

function initializeTheConfigManager() {
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
  })

  describe('#returnDefaultConfig', function () {
    it('Сравнение вывода', function () {
      // const {  }
    })
  })
})
