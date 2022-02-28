/**
 * Интерфейс config.json
 */

interface ConfigJSON {
    logChannel?: number,
    sendLogsToAGroup?: boolean,
    rules_fromChatId?: number,
    rules_messageId?: number
}

export = ConfigJSON