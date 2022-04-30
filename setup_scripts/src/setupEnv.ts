import colorTheText from './utils/colorTheText'
import schema from '../schema/envSchema'
import input from './utils/input'
import { writeFileSync } from 'fs'

require('dotenv').config()
module.exports = async () => {
  const values = {}
  // Проходимся по всем ключам для схемы .env
  for (const key in schema) {
    if (process.env[key]) {
      console.log(colorTheText('green', `✔ Ключ ${key} присутствует в .env`))
      values[key] = process.env[key]
      continue
    }

    const data = schema[key]
    console.log()
    console.log(colorTheText('blue', `[${key}]`))
    if (data.default) console.log(`Default: ${colorTheText('blue', data.default)}`)
    console.log(colorTheText('yellow', `>>> ${data.description}`))

    const value = await input(`${key}=`)
    let assignedValue
    if (!value) {
      assignedValue = data.default
    } else assignedValue = value

    // Если значение отсутствует
    if ((assignedValue ?? false) === false) continue
    process.env[key] = assignedValue
    values[key] = assignedValue
  }

  writeFileSync('.env', Object.keys(values)
    .map((k) => `${k}=${values[k]}`)
    .join('\n')
  )
}
