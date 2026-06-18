const { Client } = require('pg');

const regions = [
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3', 'ap-south-1',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1', 'eu-south-1',
  'sa-east-1', 'ca-central-1', 'af-south-1', 'me-south-1'
];

async function testRegion(region) {
  const connectionString = `postgresql://postgres.xsaaxmcejqygsdmewlmc:Sontran1903%40@aws-0-${region}.pooler.supabase.com:6543/postgres`;
  const client = new Client({ connectionString, connectionTimeoutMillis: 10000 });
  try {
    await client.connect();
    console.log(`[SUCCESS] Region found: ${region} (Auth success)`);
    await client.end();
    return true;
  } catch (err) {
    if (err.message.includes('password authentication failed')) {
      console.log(`[SUCCESS-AUTH-FAIL] Region found: ${region}, but password is wrong`);
      return true;
    }
    if (err.message.includes('ENOTFOUND')) {
      return false; // Domain not found, not this region
    }
    if (err.message.includes('tenant/user') && err.message.includes('not found')) {
      return false; // Wrong region
    }
    console.log(`[OTHER-ERROR] ${region}: ${err.message}`);
    return false;
  }
}

async function run() {
  const promises = regions.map(r => testRegion(r));
  await Promise.all(promises);
  console.log("Done testing.");
}

run();