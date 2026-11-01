import path from 'path';

/**
 * 1) 声明 env 函数的重载签名：
 *    - 当只传一个 key 时，返回 string
 *    - 当传入 defaultValue 为 string 时，返回 string
 *    - 当传入 defaultValue 为 number 时，返回 number
 *    - 当传入 defaultValue 为 boolean 时，返回 boolean
 * 
 * 并为 .bool / .int 等方法也写上签名
 */
interface StrapiEnv {
  (key: string): string;
  (key: string, defaultValue: string): string;
  (key: string, defaultValue: number): number;
  (key: string, defaultValue: boolean): boolean;

  bool(key: string, defaultValue?: boolean): boolean;
  int(key: string, defaultValue?: number): number;
  // 如果有更多方法(如 float, array 等)，可在此扩展
}

/** 2) 声明数据库类型，只允许 'mysql' | 'postgres' | 'sqlite' */
type DBClient = 'mysql' | 'postgres' | 'sqlite';

/** 3) 形参类型，接收 { env } */
interface ConfigProps {
  env: StrapiEnv;
}

/**
 * 4) 导出默认函数 - 这是一个示例 Strapi 数据库配置。
 *    你可以在 Strapi 项目中放到 config/env/xxx/database.ts (或相应位置)
 */
export default ({ env }: ConfigProps) => {
  // 告诉 TS 这只会是 'mysql' | 'postgres' | 'sqlite' 之一
  const client = env('DATABASE_CLIENT', 'sqlite') as DBClient;

  // 这里为了演示简单，connections 用 any；可进一步精细化类型
  const connections: Record<DBClient, any> = {
    mysql: {
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false) && {
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
        },
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    postgres: {
      connection: {
        connectionString: env('DATABASE_URL'),
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false) && {
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
        },
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    sqlite: {
      connection: {
        // 5) 此处无需再做 as string
        filename: path.join(
          __dirname,
          '..',
          '..',
          env('DATABASE_FILENAME', '.tmp/data.db') // 会被推断为 string
        ),
      },
      useNullAsDefault: true,
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
