/**
 * Ключи в конфиге.
 * Подробнее в файле c ../configSchema.ts
 */

interface ConfigKeys {
    id?: number,
    logChat?: number,
    adminChat?: number,
    sendLogsToAGroup?: boolean,
    bot_owner?: number,
    urlToRules?: string,
    createdAt?: Date,
    updatedAt?: Date
}

export default ConfigKeys
