import colorTheText from './utils/colorTheText'
import envSchema from '../schema/envSchema'
import input from './utils/input'
import { writeFileSync } from 'fs'

interface EnvKeys {
  [key: string]: string
}
require('dotenv').config()
module.exports = async () => {
  const values: EnvKeys = {}

  // Проходимся по всем ключам для схемы .env
  for (const key in envSchema) {
    if (process.env[key]) {
      console.log(colorTheText('green', `✔ Ключ ${key} присутствует в .env`))
      values[key] = "'" + <string>process.env[key] + "'"
    }

    const data = envSchema[key]
    console.log()
    console.log(colorTheText('blue', `[${key}]`))
    if (data.default) console.log(`По умолчанию: ${colorTheText('blue', data.default)}`)
    console.log(colorTheText('yellow', `>>> ${data.description}`))

    // Спрашиваем у пользователя значение.
    const value = await input(`${key}=`)
    let assignedValue
    if (!value) {
      assignedValue = data.default
    } else assignedValue = value

    // Если значение отсутствует.
    if ((assignedValue ?? false) === false) continue

    // Обращаем применямое значение в кавычки для надёжности.
    assignedValue = "'" + assignedValue + "'"
    process.env[key] = assignedValue
    values[key] = assignedValue
  }

  writeFileSync('.env', Object.keys(values)
    .map((k) => `${k}=${values[k]}`)
    .join('\n')
  )
}
