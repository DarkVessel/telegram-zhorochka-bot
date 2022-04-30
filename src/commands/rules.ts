import ConfigManager from '../classes/ConfigManager'
import DialogManager from '../classes/DialogManager'
import LogManager from '../classes/LogManager'
import Command from '../handlers/Command'

const logManager = new LogManager('./src/commands/rules.ts')
class RulesCommand extends Command {
  constructor () {
    super({
      allowUseInDM: true,
      checkMeAdmin: false,
      checkAdmin: false,
      checkOwner: false,
      name: 'rules',
      run (ctx) {
        if (!ConfigManager.data.urlToRules) {
          logManager.warn('COMMAND_RULES', 'Команда не может функционировать, из-за отсутствующего ключа "urlToRules" в базе данных!')
          return DialogManager.notRules(ctx)
        }
        DialogManager.rules(ctx, ConfigManager.data.urlToRules)
      }
    })
  }
}
export default RulesCommand
