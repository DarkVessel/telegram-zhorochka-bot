import Command from '../classes/Command'
class TestCommand extends Command {
  constructor () {
    super({
      allowUseInDM: false,
      checkMeAdmin: false,
      checkAdmin: false,
      checkOwner: true,
      name: 'test2',
      async run (ctx, args, { dialogManager }) {
        dialogManager.send(['Hi!'])
      }
    })
  }
}
export default TestCommand
