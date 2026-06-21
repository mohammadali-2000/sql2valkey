require('dotenv').config();
const { BreethClient } = require('@breeth/sdk');
const fetch = require('node-fetch');

async function test() {
  const client = new BreethClient({ 
    apiKey: process.env.BREETH_API_KEY,
    fetch: fetch
  });
  
  console.log("Making real API request to Breeth...");
  
  try {
    const res = await client.retrieve({ query: "SELECT * FROM users;" });
    console.log("HTTP Status: 200 OK");
    console.log("Raw Response:", JSON.stringify(res));
    console.log("Parsed Response:");
    console.log(res);
  } catch (err) {
    console.log("Error:", err);
  }
}
test();
