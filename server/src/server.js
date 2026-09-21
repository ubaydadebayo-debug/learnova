import app from './app.js';
import { env } from './config/env.js';
import { assertEnv } from './config/env.js';
import { prisma } from './config/prisma.js';

async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection: OK (PostgreSQL reachable)');
    return true;
  } catch (error) {
    console.error('Database connection failed; HTTP server will not start.');
    if (!env.isProduction) console.error(`Cause: ${error.message}`);
    return false;
  }
}

async function bootstrap() {
  try {
    assertEnv();
  } catch (error) {
    console.error(error.message);
    console.error('Fix server/.env before continuing.');
    process.exitCode = 1;
    return;
  }

  const databaseReady = await checkDatabaseConnection();
  if (!databaseReady) {
    process.exitCode = 1;
    return;
  }

  const server = app.listen(env.port, () => {
    console.log('');
    console.log('Learnova API');
    console.log(`  Environment : ${env.nodeEnv}`);
    console.log(`  Backend URL : http://localhost:${env.port}`);
    console.log(`  Health      : http://localhost:${env.port}/api/health`);
    console.log('');
  });

  const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection:', reason);
    shutdown('unhandledRejection');
  });
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    shutdown('uncaughtException');
  });
}

bootstrap();