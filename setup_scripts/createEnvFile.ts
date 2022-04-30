import { writeFileSync } from 'fs'
import schema from './schema/envSchema'
require('dotenv').config()

// Создаём файл .env
writeFileSync('.env', Object.keys(schema) // Получаем ключи со схемы
  .map((k) => `${k}=${(process.env[k] || schema[k].default) ?? ''}`) // Превращаем в выражение KEY=VALUE
  .join('\n')
)
