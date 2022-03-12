const { default: Command } = require("../../../src/handlers/Command");

class Test extends Command {
  constructor () {
    super({
      name: 'test2',
      run () {}
    })
  }
}

module.exports = Test;