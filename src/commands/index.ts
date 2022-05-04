import { Composer } from 'grammy'

import { cmd as EvalCommand } from './Developer_Tools/eval'
import { cmd as TestCommand } from './Developer_Tools/test'

export const Commands = new Composer()
Commands.use(EvalCommand)
Commands.use(TestCommand)
