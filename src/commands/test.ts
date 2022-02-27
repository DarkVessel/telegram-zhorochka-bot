import ConfigManager from "../classes/ConfigManager"

module.exports.run = (ctx) => {
    ConfigManager.data.logChannel = 93;
}
module.exports.info = {
    name: "test"
}