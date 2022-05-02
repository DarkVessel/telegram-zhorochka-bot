import CommandData from '../interfaces/CommandData'

/**
 * Данный класс инициализируется во всех командах.
 */
class Command {
  public cmd: CommandData
  constructor (command: CommandData) {
    this.cmd = command
  }
}

export default Command
