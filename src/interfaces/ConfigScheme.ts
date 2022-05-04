import { DataType } from 'sequelize-typescript'

type ValidScalars = undefined | null | string | boolean | number;
/**
 * Интерфейс для configSchema.ts
 */
interface ConfigSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    /**
     * Сюда передаётся DataTypes.TYPE
     */
    typeDB: typeof DataType[keyof typeof DataType];
    default: ValidScalars;
    description?: string;
    mutable: boolean;
    show: boolean;

    /**
     * Функция, для проверки значения.
     * В случае чего, возвращает строку с описанием того, что не так.
     */
    check?: (data: ValidScalars, ...data2: any) => void | string | Promise<void | string>;
  };
}

export default ConfigSchema
