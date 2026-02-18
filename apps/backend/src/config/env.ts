import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'access_secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refresh_secret',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173'
};
