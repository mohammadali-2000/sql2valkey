const fetch = require('node-fetch');

const queries = [
  "SELECT * FROM users WHERE id=1",
  "UPDATE users SET name='Ali'",
  "DELETE FROM users WHERE id=1",
  "COUNT(*)",
  "LIMIT",
  "ORDER BY",
  "SELECT * FROM a JOIN b ON a.id = b.id",
  "SELECT COUNT(*), status FROM users GROUP BY status",
  "SELECT COUNT(*) FROM users GROUP BY status HAVING COUNT(*) > 1",
  "SELECT * FROM (SELECT id FROM users) u",
  "WITH cte AS (SELECT * FROM users) SELECT * FROM cte",
  "selete * form users",
  "random text",
  "",
  "!@#$%^&*()"
];

async function run() {
  for (const q of queries) {
    console.log(`\nTesting: "${q}"`);
    try {
      const res = await fetch('http://localhost:3001/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      console.log(JSON.stringify(data));
    } catch (err) {
      console.log("Error:", err.message);
    }
  }
}
run();
