interface EnvFunction {
  (key: string): string;
  (key: string, defaultValue: string): string;
  (key: string, defaultValue: number): number;
  (key: string, defaultValue: boolean): boolean;

  // Strapi 常见方法:
  bool(key: string, defaultValue?: boolean): boolean;
  int(key: string, defaultValue?: number): number;
  array(key: string, defaultValue?: string[]): string[];
  // 其他方法按需扩展
}

interface ConfigProps {
  env: EnvFunction;
}

export default ({ env }: ConfigProps) => ({
  host: env('HOST', '0.0.0.0'), // => string
  port: env.int('PORT', 1337),  // => number
  app: {
    keys: env.array('APP_KEYS', ['myKey1', 'myKey2']), // => string[]
  },
});
