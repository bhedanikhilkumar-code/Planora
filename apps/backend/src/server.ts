import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './utils/prisma.js';

const server = app.listen(env.port, () => {
  console.log(`Planora API listening on ${env.port}`);
});

const shutdown = (signal: NodeJS.Signals) => {
  console.log(`Received ${signal}, shutting down...`);
  server.close(async (closeErr) => {
    if (closeErr) {
      console.error('HTTP server close failed', closeErr);
      process.exitCode = 1;
    }

    try {
      await prisma.$disconnect();
    } catch (dbErr) {
      console.error('Prisma disconnect failed', dbErr);
      process.exitCode = 1;
    } finally {
      process.exit();
    }
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
