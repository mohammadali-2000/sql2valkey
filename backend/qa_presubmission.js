const fetch = require('node-fetch');

const tests = [
  { q: "SELECT * FROM users WHERE id = 1", desc: "TEST 1: SELECT (First Request)" },
  { q: "SELECT * FROM users WHERE id = 1", desc: "TEST 2: SELECT (Second Request, should hit cache)" },
  { q: "DELETE FROM users WHERE id = 1", desc: "TEST 3: DELETE" },
  { q: "UPDATE users SET name='Ali' WHERE id=1", desc: "TEST 4: UPDATE" },
  { q: "SELECT COUNT(*) FROM users", desc: "TEST 5: COUNT(*)" },
  { q: "SELECT * FROM users LIMIT 10", desc: "TEST 6: LIMIT 10" },
  { q: "SELECT * FROM users ORDER BY score DESC", desc: "TEST 7: ORDER BY" },
  { q: "SELECT * FROM users JOIN orders ON users.id=orders.user_id", desc: "TEST 8: JOIN" },
  { q: "SELECT department, COUNT(*) FROM employees GROUP BY department", desc: "TEST 9: GROUP BY" },
  { q: "random text", desc: "TEST 10: random text" },
  { q: "", desc: "TEST 11: Empty input" }
];

async function run() {
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`\n${test.desc}`);
    console.log(`Input: ${test.q || '[empty input]'}`);
    try {
      const res = await fetch('http://localhost:3001/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: test.q })
      });
      const data = await res.json();
      console.log(`HTTP Status: ${res.status}`);
      console.log(`Response JSON: ${JSON.stringify(data)}`);
      
      // Determine PASS/FAIL
      let pass = true;
      if (res.status >= 500) pass = false;
      if (!data) pass = false;
      
      if (i === 1 && data.source !== 'cache') pass = false; // Test 2 must be cache hit
      
      console.log(`PASS / FAIL: ${pass ? 'PASS' : 'FAIL'}`);
    } catch (err) {
      console.log("Error:", err.message);
      console.log(`PASS / FAIL: FAIL`);
    }
  }
}
run();
