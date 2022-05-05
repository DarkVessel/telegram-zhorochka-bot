import { checkPermissions, generateBasicDialogTags } from '../../utils/index'
import { Composer } from 'grammy'

import ConfigManager from '../../classes/ConfigManager'
import DialogManager from '../../classes/DialogManager'
import LogManager from '../../classes/LogManager'

// Диалоги
import noRules from '../../contents/commands/"rules"/noRules.dialogues'
import rules from '../../contents/commands/"rules"/rules.dialogues'

const logManager = new LogManager('./src/commands/rules.ts')
export const cmd = new Composer()
cmd
  .command('rules')
  .filter((ctx) => checkPermissions('rules', ctx, {
    allowUseInDM: true,
    checkOwner: false,
    checkAdmin: false,
    checkMeAdmin: false
  }))
  .use((ctx) => {
    const dialogManager = new DialogManager(ctx.chat.id, ctx.message?.message_id)
    const tags = generateBasicDialogTags(ctx)

    // Если правила отсутствуют.
    if (!ConfigManager.data.urlToRules) {
      logManager.warn('COMMAND_RULES', 'Команда не может функционировать, из-за отсутствующего ключа "urlToRules" в базе данных!')
      dialogManager.send(noRules, { tags })
      return
    }

    // Отправляем правила.
    dialogManager.send(rules, {
      tags: Object.assign(tags, {
        url: ConfigManager.data.urlToRules
      })
    })
  })
