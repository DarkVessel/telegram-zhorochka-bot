import ConfigManager from "../../classes/ConfigManager";
import LogManager from "../../classes/LogManager";

const log = new LogManager("./src/handlers/start/hello.ts");
module.exports = (ctx) => {
    log.log("TEST", "Test");
}