require('dotenv').config();
const { BreethClient } = require('@breeth/sdk');

async function test() {
  console.log('API Key:', process.env.BREETH_API_KEY);
  
  const client = new BreethClient({
    apiKey: process.env.BREETH_API_KEY
  });
  
  // Let's inspect the client methods
  console.log('Client Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
  
  try {
    const res = await client.retrieve({ query: "SELECT * FROM users WHERE id = 1" });
    console.log('Status: 200 (Success)');
    console.log('Raw Response:', JSON.stringify(res, null, 2));
  } catch (error) {
    console.log('Status: Error');
    console.log('Error:', error);
  }
}
test();
