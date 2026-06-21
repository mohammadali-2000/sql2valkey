require('dotenv').config();
const { BreethClient } = require('@breeth/sdk');

async function test() {
  const client = new BreethClient({ apiKey: process.env.BREETH_API_KEY });
  
  try {
    const res = await client.retrieve({ query: "PostgreSQL to Valkey" });
    console.log(JSON.stringify(res, null, 2));
    
    // Let's also check groups
    const groups = await client.groups();
    console.log("\nGroups:", JSON.stringify(groups, null, 2));

    // Let's check graph episodes
    const episodes = await client.graph.listEpisodes();
    console.log("\nEpisodes:", JSON.stringify(episodes, null, 2));
  } catch (err) {
    console.log(err);
  }
}
test();
