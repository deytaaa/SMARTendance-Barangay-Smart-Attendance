const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Warm up connection on startup so first user request is instant
prisma.$connect()
  .then(async () => {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection established');
  })
  .catch((err) => console.error('Database connection failed:', err.message));

// Keep-alive ping every 4 minutes to prevent Supabase free-tier sleep
setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (_) {
    // silently ignore, server may be shutting down
  }
}, 4 * 60 * 1000).unref();

module.exports = prisma;
