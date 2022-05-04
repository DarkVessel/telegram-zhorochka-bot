import checkPermissions from '../../utils/checkPermissions'
import { Composer } from 'grammy'

export const cmd = new Composer()

cmd
  .command('test')
  .filter((ctx) => checkPermissions('test', ctx, {
    allowUseInDM: false,
    checkOwner: true,
    checkAdmin: false,
    checkMeAdmin: false
  }))
  .use((ctx) => {
    ctx.reply('Hi!')
  })
