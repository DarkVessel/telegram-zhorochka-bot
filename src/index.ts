// Вывод в консоль.
console.log('[PROJECT] Start!')

// Вызывается модуль dotenv, который сканирует .env файл.
// Значения записываются в process.env
require('dotenv').config()

// Вызов файла telegramClient.ts
require('./telegramClient')
