import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env file configurations
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  JWT_SECRET: z.string().min(10, { message: "JWT_SECRET must be at least 10 characters long" }),
  GEMINI_API_KEY: z.string().min(1, { message: "GEMINI_API_KEY is required" }),
  APP_URL: z.string().url().optional().default('http://localhost:3000'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ CRITICAL: Invalid environment configuration:");
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error("Invalid backend environment variables. Please check your config.");
  }

  return result.data;
};

const env = parseEnv();

export default env;
export { env };
