const fetch = require('node-fetch');

async function test(query, description) {
  console.log(`\n--- ${description} ---`);
  try {
    const res = await fetch('http://localhost:3001/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    console.log(`Query: ${query}`);
    console.log(`Source: ${data.source === 'cache' ? 'Cache HIT' : 'Cache MISS'}`);
    console.log(`Valkey Command: ${data.valkeyCommand}`);
  } catch (err) {
    console.log("Error:", err.message);
  }
}

async function run() {
  await test("SELECT * FROM users WHERE id = 1", "TEST 1: SELECT (First Request)");
  await test("SELECT * FROM users WHERE id = 1", "TEST 1: SELECT (Second Request)");
  
  await test("DELETE FROM users WHERE id = 1", "TEST 2: DELETE");
  await test("UPDATE users SET name='Ali' WHERE id=1", "TEST 3: UPDATE");
}

run();
