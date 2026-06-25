const Redis = require('ioredis');
const valkey = new Redis('redis://localhost:6379');

async function run() {
  const query = "SELECT * FROM audit_table;";
  const cacheKey = 'sql2valkey:' + Buffer.from(query).toString('base64');
  
  // Ensure clear state
  await valkey.del(cacheKey);

  console.log("======================================");
  console.log("CACHE VERIFICATION SCRIPT");
  console.log("======================================\n");
  
  console.log("1. Sending First Request (Expect Miss)");
  const res1 = await fetch('http://localhost:3001/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const data1 = await res1.json();
  console.log(`-> Response 'cached' flag: ${data1.cached}`);
  console.log(`-> Cache Miss = ${data1.cached === false ? 'PASS' : 'FAIL'}\n`);

  console.log("2. Sending Second Request (Expect Hit)");
  const res2 = await fetch('http://localhost:3001/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const data2 = await res2.json();
  console.log(`-> Response 'cached' flag: ${data2.cached}`);
  console.log(`-> Cache Hit = ${data2.cached === true ? 'PASS' : 'FAIL'}\n`);

  console.log("3. Inspecting Valkey Database directly");
  console.log(`-> Key Stored = ${cacheKey}`);
  const storedValue = await valkey.get(cacheKey);
  console.log(`-> Value Stored = ${storedValue}\n`);

  console.log("======================================");
  console.log("VERIFICATION COMPLETE");
  console.log("======================================");
  
  process.exit(0);
}
run().catch(console.error);
