import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().refine(
    (value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .every((origin) => z.url().safeParse(origin).success),
    'WEB_ORIGIN harus berisi URL valid yang dipisahkan koma',
  ),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
});

export function validateEnvironment(config: Record<string, unknown>) {
  return environmentSchema.parse(config);
}
