/**
 * Ключи в конфиге.
 * Подробнее в файле c ../configSchema.ts
 */

 interface ConfigKeys {
  id?: number,
  logChat?: number,
  adminChat?: number,
  sendLogsToAGroup?: boolean,
  botOwner?: number,
  urlToRules?: string,
  messageDeletionTimeout?: number,
  createdAt?: Date,
  updatedAt?: Date
}

export default ConfigKeys
