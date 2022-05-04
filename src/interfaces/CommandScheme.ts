/**
 * Основная информация о команде. Будет применяться в команде /help
 */
interface CommandInfo {
  /** Название команды. */
  name: string,

  /** Показывать ли её в подсказках и в команде /help? */
  show: boolean,

  /** Краткое описание для подсказок. */
  shortDescription: string,

  /** Полное описание для команды /help */
  description: string,

  /** Категория команды, для /help */
  category: string,

  /** Примеры использования */
  examples?: Array<string>
}

export default CommandInfo
