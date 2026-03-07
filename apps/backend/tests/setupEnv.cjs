process.env.PORT ??= '4000';
process.env.DATABASE_URL ??= 'postgresql://planora:planora@localhost:5432/planora?schema=public';
process.env.JWT_ACCESS_SECRET ??= 'test_access_secret_at_least_16_chars';
process.env.JWT_REFRESH_SECRET ??= 'test_refresh_secret_at_least_16_chars';
process.env.FRONTEND_URL ??= 'http://localhost:5173';
