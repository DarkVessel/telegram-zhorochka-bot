import { Composer } from 'grammy'

import { cmd as EvalCommand } from './Developer_Tools/eval'
import { cmd as TestCommand } from './Developer_Tools/test'
import { cmd as SrcCommand } from './Developer_Tools/src'

import { cmd as RulesCommand } from './Basic/rules'
export const Commands = new Composer()

Commands.use(EvalCommand)
Commands.use(TestCommand)
Commands.use(SrcCommand)

Commands.use(RulesCommand)
