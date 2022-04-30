interface envSchema {
  [key: string]: {
    default: null | string | number | boolean,
    description: string
  }
}

/**
 * Эта схема содержит все ключи, которые находятся в .env
 * В качестве дефолтного значения может содержаться как null, так и другое значение.
 */
const schema: envSchema = {
  BOT_TOKEN: {
    default: null,
    description: 'Токен для Телеграм бота'
  },
  MYSQL_DATABASE: {
    default: null,
    description: 'Название базы данных от MySQL'
  },
  MYSQL_USERNAME: {
    default: null,
    description: 'Имя пользователя от MySQL'
  },
  MYSQL_PASSWORD: {
    default: null,
    description: 'Пароль от пользователя в MySQL'
  },
  MYSQL_HOST: {
    default: 'localhost',
    description: 'Путь к хосту MySQL'
  },
  MYSQL_PORT: {
    default: 3306,
    description: 'Порт, требуемый для подключения к MySQL'
  }
}

export default schema
