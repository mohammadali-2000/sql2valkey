const fetch = require('node-fetch');

const tests = [
  "SELECT * FROM users WHERE id = 1",
  "DELETE FROM users WHERE id = 1",
  "UPDATE users SET name='Ali' WHERE id=1",
  "SELECT COUNT(*) FROM users",
  "SELECT * FROM users LIMIT 10",
  "SELECT * FROM users ORDER BY score DESC",
  "SELECT * FROM users JOIN orders ON users.id=orders.user_id",
  "SELECT department, COUNT(*) FROM employees GROUP BY department",
  "random text",
  ""
];

async function run() {
  for (let i = 0; i < tests.length; i++) {
    const q = tests[i];
    console.log(`\nTest ${i+1}: ${q || '[empty input]'}`);
    try {
      const res = await fetch('http://localhost:3001/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      console.log(`Status: ${res.status}`);
      console.log(`Response: ${JSON.stringify(data)}`);
    } catch (err) {
      console.log("Error:", err.message);
    }
  }
}
run();
