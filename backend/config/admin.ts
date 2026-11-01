interface StrapiEnv {
  (key: string): string;
  (key: string, defaultValue: string | number | boolean): string | number | boolean;
  bool(key: string, defaultValue?: boolean): boolean;
  int(key: string, defaultValue?: number): number;
}

// 给 config props 声明一个类型
interface ConfigProps {
  env: StrapiEnv;
}

export default ({ env }:ConfigProps) => ({
  auth: {
    secret: env('JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'aVeryLongRandomStringHere123456789'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
});
