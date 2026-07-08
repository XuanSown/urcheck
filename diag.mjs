import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sql = `
SELECT table_name
FROM information_schema.tables
WHERE table_schema='public'
ORDER BY table_name;
`;

const tables = await prisma.$queryRawUnsafe(sql);
console.log('=== TABLES (real DB) ===');
console.table(tables);

const cols = await prisma.$queryRawUnsafe(`
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name='Product'
ORDER BY ordinal_position;
`);
console.log('=== Product COLUMNS ===');
console.table(cols);

await prisma.$disconnect();
