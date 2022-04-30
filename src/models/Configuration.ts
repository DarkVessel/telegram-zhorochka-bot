import { Model, ModelAttributes } from 'sequelize'
import configSchema from '../configSchema'
import sequelize from '../sequelize'

const model: ModelAttributes<Model<any, any>, any> = {}
for (const key in configSchema) {
  const data = configSchema[key]
  model[key] = {
    type: data.typeDB,
    defaultValue: data.default
  }
}

const Configuration = sequelize.define('Configuration', model)
export default Configuration
