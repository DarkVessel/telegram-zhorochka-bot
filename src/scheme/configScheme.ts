import { DataTypes } from 'sequelize'
import ConfigScheme from '../interfaces/ConfigScheme'

const scheme: ConfigScheme = {
  logChat: {
    type: 'number',
    typeDB: DataTypes.BIGINT,
    default: undefined,
    description: 'ID группы, куда будут скидываться логи и ошибки.',
    mutable: true,
    show: true
  },
  adminChat: {
    type: 'number',
    typeDB: DataTypes.BIGINT,
    default: undefined,
    description: 'ID группы, где сидят Администраторы вашего проекта. Туда будет скидываться важная информация.',
    mutable: true,
    show: true
  },
  sendLogsToAGroup: {
    type: 'boolean',
    typeDB: DataTypes.BOOLEAN,
    default: false,
    description: 'Отправлять логи в группу?',
    mutable: true,
    show: true
  },
  botOwner: {
    type: 'number',
    typeDB: DataTypes.BIGINT,
    default: undefined,
    description: 'ID аккаунта создателя бота.',
    mutable: false,
    show: true
  },
  urlToRules: {
    type: 'string',
    typeDB: DataTypes.STRING,
    default: undefined,
    description: 'URL-ссылка на правила вашего чата.',
    mutable: true,
    show: true
  },
  messageDeletionTimeout: {
    type: 'number',
    typeDB: DataTypes.INTEGER,
    default: 11500,
    description: 'Тайм-аут удаления ненужных сообщений, к примеру о том, что пользователь неправльно ввёл команду. Значение 0 отключает эту функцию.',
    mutable: true,
    show: true
  }
}

export default scheme
