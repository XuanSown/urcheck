const { Client } = require('pg');

async function testPooler() {
  const connectionString = `postgresql://postgres:Sontran1903%40@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`;
  const client = new Client({ connectionString, connectionTimeoutMillis: 10000 });
  try {
    await client.connect();
    console.log(`[SUCCESS] Pooler connection works!`);
    await client.end();
  } catch (err) {
    console.log(`[FAIL] Pooler: ${err.message}`);
  }
}

testPooler();