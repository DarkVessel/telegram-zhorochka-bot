import { DataTypes, Model, ModelAttributes } from 'sequelize'
import sequelize from '../sequelize'

const model: ModelAttributes<Model<any, any>, any> = {
  /** ID нарушителя. */
  offenderId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },

  /** Полное имя нарушителя. */
  offenderFullName: {
    type: DataTypes.STRING,
    allowNull: false
  },

  /** ID модератора. */
  moderatorId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },

  /** Полное имя модератора. */
  moderatorFullName: {
    type: DataTypes.STRING,
    allowNull: false
  },

  /** ID сообщения нарушителя. */
  offenderMessageId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },

  /** Сообщение нарушителя. */
  offenderMessageContent: {
    type: DataTypes.STRING,
    allowNull: true
  },

  /** ID Сообщения бота о выдаче предупреждения. */
  botMessageId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },

  /** ID чата, где было нарушение. */
  chatId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },

  /** ID сообщения от бота в админ-чате. */
  botMessageIDAdminChat: {
    type: DataTypes.BIGINT,
    allowNull: false
  },

  /** Причина выдачи предупреждения. */
  reason: {
    type: DataTypes.STRING,
    allowNull: true
  },

  /** Устарело, то есть не учитывать предупреждение за действительное. */
  irrelevant: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  }
}

const Warns = sequelize.define('Warn', model)
export default Warns
