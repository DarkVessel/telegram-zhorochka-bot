// import { TextChannel, Message } from 'discord.js';
// import { timezone } from 'strftime';

// const strftime = timezone(180);
// const colors = {
//   error: '31',
//   warn: '33',
// };

// interface BlockCode {
//   code: string,
//   msg: string
// };
// type returnMethods = boolean | Promise<Message>;

// const strip: string = '-'.repeat(50);
// class LogManager {
//   // Каналы, куда будут отправляться логи.
//   static channelConsole: null | TextChannel = null;
//   static channelErrors: null | TextChannel = null;

//   // Последний путь, о котором сообщалось в логах.
//   static lastPath: string = '';
//   public path;

//   // Последний тип лога который использовался, например warn
//   static lastTypeLog: string = ';'

//   constructor(path: string) {
//     this.path = path;
//   };

//   /**
//      * Отправляет сообщение в консоль и чат в Дискорде.
//      * @param type { 'log' | 'error' | 'warn' } - Тип лога
//      * @param title - Сообщение
//      * @param blocks - Дополнительные блоки.
//      * @returns { returnMethods }
//      */
//   private _send(type: 'log' | 'error' | 'warn', title: string, blocks?: Array<BlockCode>): returnMethods {
//     const time = strftime('%H:%M:%S', new Date());

//     let showPath = false;
//     if (this.path !== LogManager.lastPath || type !== LogManager.lastTypeLog) {
//       showPath = true;
//       LogManager.lastPath = this.path;
//       LogManager.lastTypeLog = type;
//       console.log(`\n 033[01;44m${this.path}033[00m`);
//     }

//     // [type: time] >> Colors Text
//     console[type](`[${type.toUpperCase()}: ${time}] >> ${colors[type] ? `033[01;${colors[type]}m` : ''}${title} 033[00m`);
//     if (blocks?.length) {
//       for (const block of blocks) {
//         console[type](`${strip}\n${block.msg}\n${strip}`);
//       };
//     };

//     // Если ни один канал не работает.
//     if (!LogManager.channelConsole && !LogManager.channelErrors) return false;

//     // Получить либо первый, либо второй канал.
//     const channel = <TextChannel>(type !== 'log'
//       ? (LogManager.channelErrors || LogManager.channelConsole)
//       : (LogManager.channelConsole || LogManager.channelErrors)
//       );

//     // Отступ.
//     let formatBlocks: string = '';
//     if (blocks?.length) {
//       title += '\n';

//       formatBlocks = blocks.map(b => `\`\`\`${b.code}\n${b.msg}\n\`\`\``).join('\n');
//     };

//     // Отправка лога.
//     return channel.send({
//       content: `${showPath ? `>> **${this.path}**\n` : ''}${title}${formatBlocks ?? ''}`,
//     });
//   }

//   public log(title: string, blocks?: Array<BlockCode>): returnMethods {
//     return this._send('log', `**${title}**`, blocks);
//   }

//   public error(title: string, error?: string, blocks?: Array<BlockCode>): returnMethods {
//     if (error) {
//       const blockData = { code: 'js', msg: error };
//       if (!blocks) blocks = [blockData];
//       else blocks.push(blockData);
//     }
//     return this._send('error', `**${title}**`, blocks);
//   }

//   public warn(title: string, warn?: string, blocks?: Array<BlockCode>): returnMethods {
//     if (warn) {
//       const blockData = { code: 'js', msg: warn };
//       if (!blocks) blocks = [blockData];
//       else blocks.push(blockData);
      
//     }
//     return this._send('warn', `**${title}**`, blocks);
//   }
// }

// export default LogManager;