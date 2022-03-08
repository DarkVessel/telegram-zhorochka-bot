const { default: Command } = require("../../src/handlers/Command");

class Test extends Command {
  constructor () {
    super({
      name: 'test',
      run (ctx) {}
    })
  }
}

module.exports = Test;