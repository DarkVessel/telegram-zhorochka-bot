import { DataTypes, Model, ModelAttributes } from 'sequelize'
import sequelize from '../sequelize'

const model: ModelAttributes<Model<any, any>, any> = {
  offenderId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  offenderFullName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  moderatorId: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  moderatorFullName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  offenderMessageId: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  offenderMessageContent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  botMessageId: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  chatId: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  botMessageIDAdminChat: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  irrelevant: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  }
}

const Warns = sequelize.define('Warn', model)
export default Warns
