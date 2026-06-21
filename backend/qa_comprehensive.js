const fetch = require('node-fetch');

const tests = [
  "INSERT INTO users (id, name) VALUES (1, 'Ali');",
  "SELECT name, age FROM users WHERE id = 1;",
  "SELECT * FROM users;",
  "CREATE TABLE users (id INT, name VARCHAR);",
  "DROP TABLE users;",
  "TRUNCATE TABLE users;",
  "EXISTS (SELECT 1 FROM users WHERE id=1);",
  "DELETE * FROM users WHERE id = '1';",
  "UPDATE users SET name='Ali' WHERE id='1';"
];

async function run() {
  for (let i = 0; i < tests.length; i++) {
    const q = tests[i];
    try {
      const res = await fetch('http://localhost:3001/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      console.log(`\nInput: ${q}`);
      console.log(`Valkey Command: ${data.valkeyCommand}`);
    } catch (err) {
      console.log("Error:", err.message);
    }
  }
}
run();
