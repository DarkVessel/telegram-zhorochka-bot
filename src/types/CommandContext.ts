import { Context, Filter } from 'grammy'

type CommandContext<C extends Context> = Filter<
  C & { match: string },
  ':entities:bot_command'
>;

export default CommandContext
