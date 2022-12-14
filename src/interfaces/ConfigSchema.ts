import { DataTypes } from "sequelize/types";

type ValidScalars = null | string | boolean | number;
type JSONType = ValidScalars | ValidScalars[] | { [key: string]: ValidScalars | JSONType } | JSONType[];

/**
 * Интерфейс для configSchema.ts
 */
interface ConfigSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    /**
     * Сюда передаётся DataTypes.TYPE
     */
    typeDB: typeof DataTypes[keyof typeof DataTypes];
    default: JSONType | undefined;
    description?: string;
    mutable: boolean;
    show: boolean;

    /**
     * Функция, для проверки значения.
     * В случае чего, возвращает строку с описанием того, что не так.
     */
    check?: (data: JSONType, ...data2: any) => void | string | Promise<void | string>;
  };
}

export default ConfigSchema;
