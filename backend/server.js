require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');
const sqlMappings = require('./sqlMappings');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Valkey connection (ioredis is fully compatible)
const valkey = new Redis(process.env.VALKEY_URL || 'redis://localhost:6379');

valkey.on('connect', () => {
  console.log('Connected to Valkey local cache');
});

valkey.on('error', (err) => {
  console.error('Valkey connection error:', err);
});

// Function to translate SQL using simple regex rules based on sqlMappings
function translateSqlToValkey(query) {
  // Strip trailing semicolons and trim
  const cleanQuery = query.replace(/;+\s*$/, '').trim();
  const upperQuery = cleanQuery.toUpperCase();
  
  // CREATE / DROP / TRUNCATE
  if (upperQuery.startsWith("CREATE TABLE") || upperQuery.startsWith("DROP TABLE") || upperQuery.startsWith("TRUNCATE TABLE")) {
    return {
      valkeyCommand: "Unsupported Operation",
      dataStructure: "N/A",
      explanation: "Valkey is a schemaless key-value data structure store. It does not use tables, columns, or structured schemas."
    };
  }

  // INSERT INTO <table> (cols) VALUES (vals)
  const insertMatch = cleanQuery.match(/^INSERT\s+INTO\s+(\w+).*VALUES\s*\(([^)]+)\)/i);
  if (insertMatch) {
    const table = insertMatch[1];
    return {
      valkeyCommand: `HSET ${table}:<new_id> ...`,
      dataStructure: "Hash / String",
      explanation: "Creates a new key holding a string value or a hash. Additional commands like SADD might be used to add the ID to a secondary index set."
    };
  }

  // SELECT * FROM <table> WHERE id = <id>
  const selectIdMatch = cleanQuery.match(/^SELECT\s+(.*?)\s+FROM\s+(\w+)\s+WHERE\s+id\s*=\s*['"]?([^'"]+)['"]?/i);
  if (selectIdMatch) {
    const cols = selectIdMatch[1].trim();
    const table = selectIdMatch[2];
    const id = selectIdMatch[3];
    const cmd = cols === '*' ? `HGETALL ${table}:${id}` : `HMGET ${table}:${id} ${cols.split(',').map(c => c.trim()).join(' ')}`;
    return { 
      valkeyCommand: cmd, 
      dataStructure: "Hash", 
      explanation: "Retrieves the value of a single key or specific hash fields. In Valkey, row records are typically stored as Hash maps with keys patterned like 'tablename:id'." 
    };
  }

  // SELECT (All / Generic)
  const selectAllMatch = cleanQuery.match(/^SELECT\s+(.*?)\s+FROM\s+(\w+)/i);
  if (selectAllMatch && !upperQuery.includes("WHERE ID") && !upperQuery.includes("COUNT") && !upperQuery.includes("JOIN") && !upperQuery.includes("GROUP BY")) {
    return {
      valkeyCommand: "Unsupported Operation (Requires SCAN)",
      dataStructure: "N/A",
      explanation: "Valkey cannot efficiently query all records without a secondary index. You would need to maintain a Set of IDs and use SSCAN followed by multiple HGETALLs."
    };
  }

  // EXISTS
  if (upperQuery.includes("EXISTS")) {
    return {
      valkeyCommand: "EXISTS <table>:<id>",
      dataStructure: "Any",
      explanation: "Returns 1 if the key exists, or 0 if it does not. Highly efficient O(1) operation."
    };
  }

  // DELETE FROM <table> WHERE id = <id>
  const deleteMatch = cleanQuery.match(/^DELETE\s+(?:\*\s+)?FROM\s+(\w+)\s+WHERE\s+id\s*=\s*['"]?([^'"]+)['"]?/i);
  if (deleteMatch) {
    const table = deleteMatch[1];
    const id = deleteMatch[2];
    return { 
      valkeyCommand: `DEL ${table}:${id}`, 
      dataStructure: "Any", 
      explanation: "Removes the specified key from the database entirely." 
    };
  }

  // UPDATE <table> SET <col>='<val>' WHERE id=<id>
  const updateMatch = cleanQuery.match(/^UPDATE\s+(\w+)\s+SET\s+(\w+)\s*=\s*['"]?([^'"]+)['"]?\s+WHERE\s+id\s*=\s*['"]?([^'"]+)['"]?/i);
  if (updateMatch) {
    const table = updateMatch[1];
    const col = updateMatch[2];
    const val = updateMatch[3];
    const id = updateMatch[4];
    return { 
      valkeyCommand: `HSET ${table}:${id} ${col} ${val}`, 
      dataStructure: "Hash", 
      explanation: "Overwrites specific fields within a Hash representing the row." 
    };
  }
  
  // JOIN
  if (upperQuery.includes("JOIN")) {
    return {
      valkeyCommand: "Unsupported Operation",
      dataStructure: "N/A",
      explanation: "Valkey is a key-value store and does not support relational JOINs natively. Data must be denormalized or joined in the application layer."
    };
  }

  // GROUP BY
  if (upperQuery.includes("GROUP BY")) {
    return {
      valkeyCommand: "Unsupported Operation",
      dataStructure: "N/A",
      explanation: "No direct equivalent. Requires maintaining pre-aggregated buckets manually using Hashes."
    };
  }

  // COUNT(*)
  if (upperQuery.includes("COUNT(*)")) {
    return {
      valkeyCommand: "SCARD users:all_ids",
      dataStructure: "Set",
      explanation: "There is no direct 'COUNT(*)' for arbitrary filters. You must use SCARD to count elements in a pre-maintained Set of IDs."
    };
  }

  // LIMIT 10
  if (upperQuery.includes("LIMIT 10")) {
    return {
      valkeyCommand: "LRANGE users:list 0 9",
      dataStructure: "List",
      explanation: "Pagination/limits can be achieved using the start and stop indices of LRANGE."
    };
  }

  // ORDER BY score DESC
  if (upperQuery.includes("ORDER BY SCORE DESC")) {
    return {
      valkeyCommand: "ZREVRANGE users:by_score 0 9",
      dataStructure: "Sorted Set",
      explanation: "Requires data architecture foresight. IDs must be stored in a Sorted Set (ZSET) scored by the column you wish to order by. ZREVRANGE returns elements in descending order."
    };
  }
  
  // Fallback
  return { 
    valkeyCommand: "No direct matching rule.", 
    dataStructure: "Unknown", 
    explanation: "Fallback rule triggered. See sqlMappings.js for general mapping." 
  };
}

// Translate Endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'SQL query is required' });
    }

    const cacheKey = `sql2valkey:${Buffer.from(query).toString('base64')}`;

    // 1. Check Valkey Cache
    const cachedResponse = await valkey.get(cacheKey);
    if (cachedResponse) {
      console.log('Cache hit for query');
      return res.json({
        ...JSON.parse(cachedResponse),
        cached: true,
        source: 'cache'
      });
    }

    console.log('Cache miss. Using Rule Engine...');

    // 2. Call the rule engine
    const aiResponseJSON = translateSqlToValkey(query);

    // 4. Save to Valkey Cache (expire after 1 hour for demo)
    await valkey.setex(cacheKey, 3600, JSON.stringify(aiResponseJSON));

    // 5. Return response
    return res.json({
      ...aiResponseJSON,
      cached: false,
      source: 'rule-engine'
    });

  } catch (error) {
    console.error('Error in translation endpoint:', error);
    res.status(500).json({ error: 'Failed to process translation request.' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
