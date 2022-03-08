// Вывод в консоль.
console.log('[PROJECT] Start!')

// Вызывается модуль dotenv, который сканирует .env файл.
// Значения записываются в process.env
require('dotenv').config()

// Проверяется наличие BOT_TOKEN в файле .env
if (!process.env.BOT_TOKEN) {
  throw new Error('Отсутствует значение "BOT_TOKEN" в .env файле.')
}

// Вызов файла telegramClient.ts
require('./telegramClient')

// if (!process.env.MONGODB_URL)
//     throw new Error('Отсутствует значение "MONGODB_URL" в .env Файле.')
