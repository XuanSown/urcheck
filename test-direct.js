const { Client } = require('pg');

async function testDirect() {
  const connectionString = `postgresql://postgres:Sontran1903%40@db.xsaaxmcejqygsdmewlmc.supabase.co:5432/postgres`;
  const client = new Client({ connectionString, connectionTimeoutMillis: 10000 });
  try {
    await client.connect();
    console.log(`[SUCCESS] Direct connection works!`);
    await client.end();
  } catch (err) {
    console.log(`[FAIL] Direct: ${err.message}`);
  }
}

testDirect();