const fetch = require('node-fetch');

async function test(query, description) {
  try {
    const res = await fetch('http://localhost:3001/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    console.log(`Query: ${query}`);
    console.log(`Valkey Command: ${data.valkeyCommand}`);
    console.log(`Source: ${data.source}`);
  } catch (err) {
    console.log("Error:", err.message);
  }
}

test("delete * FROM users WHERE id = 1;", "TEST: DELETE with asterisk");
