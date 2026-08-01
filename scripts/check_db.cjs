const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://neondb_owner:npg_Dw2zRI0Wnjpr@ep-fragrant-wildflower-auiaai5w-pooler.c-10.us-east-1.aws.neon.tech/neondb?channel_binding=require&connect_timeout=15&sslmode=require' } },
  log: ['error', 'warn', 'info']
});

(async () => {
  try {
    console.log('Conectando...');
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;`;
    console.log('Tablas:', tables);
    const users = await prisma.user.count();
    console.log('Users count:', users);
  } catch (e) {
    console.error('ERROR:', e.message);
    console.error('CODE:', e.code);
  } finally {
    await prisma.$disconnect();
  }
})();
