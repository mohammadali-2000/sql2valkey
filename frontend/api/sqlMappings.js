const sqlToValkeyMappings = [
  {
    sqlOperation: "SELECT by id",
    valkeyCommand: "GET / HGETALL",
    dataStructure: "String / Hash",
    exampleCommand: "GET users:1",
    explanation: "Retrieves the value of a single key. In Valkey, row records are typically stored as serialized JSON strings (GET) or as Hash maps (HGETALL) with keys patterned like 'tablename:id'.",
    confidenceLevel: "High",
    flagged: false
  },
  {
    sqlOperation: "INSERT",
    valkeyCommand: "SET / HSET",
    dataStructure: "String / Hash",
    exampleCommand: "SET users:2 '{\"name\":\"Ali\",\"age\":30}'",
    explanation: "Creates a new key holding a string value or a hash. Additional commands like SADD might be used to add the ID to a secondary index set.",
    confidenceLevel: "High",
    flagged: false
  },
  {
    sqlOperation: "UPDATE",
    valkeyCommand: "SET / HSET",
    dataStructure: "String / Hash",
    exampleCommand: "HSET users:1 name 'Ali'",
    explanation: "Overwrites the entire string value (SET) or updates specific fields within a Hash (HSET).",
    confidenceLevel: "High",
    flagged: false
  },
  {
    sqlOperation: "DELETE",
    valkeyCommand: "DEL",
    dataStructure: "Any",
    exampleCommand: "DEL users:1",
    explanation: "Removes the specified key from the database entirely.",
    confidenceLevel: "High",
    flagged: false
  },
  {
    sqlOperation: "EXISTS",
    valkeyCommand: "EXISTS",
    dataStructure: "Any",
    exampleCommand: "EXISTS users:1",
    explanation: "Returns 1 if the key exists, or 0 if it does not. Highly efficient O(1) operation.",
    confidenceLevel: "High",
    flagged: false
  },
  {
    sqlOperation: "COUNT(*)",
    valkeyCommand: "DBSIZE / SCARD / HLEN",
    dataStructure: "Global / Set / Hash",
    exampleCommand: "SCARD users:all_ids",
    explanation: "There is no direct 'COUNT(*)' for arbitrary filters. You must use DBSIZE for all keys, SCARD to count elements in a pre-maintained Set of IDs, or HLEN for fields in a Hash.",
    confidenceLevel: "Medium",
    flagged: false
  },
  {
    sqlOperation: "ORDER BY",
    valkeyCommand: "ZRANGE",
    dataStructure: "Sorted Set",
    exampleCommand: "ZRANGE users:by_age 0 -1",
    explanation: "Requires data architecture foresight. IDs must be stored in a Sorted Set (ZSET) scored by the column you wish to order by.",
    confidenceLevel: "Medium",
    flagged: false
  },
  {
    sqlOperation: "LIMIT",
    valkeyCommand: "LRANGE / ZRANGE (with LIMIT)",
    dataStructure: "List / Sorted Set",
    exampleCommand: "LRANGE users:recent 0 9",
    explanation: "Pagination/limits can be achieved using the start and stop indices of LRANGE or ZRANGE. To mimic SQL LIMIT offset, count, use ZRANGEBYSCORE with the LIMIT argument.",
    confidenceLevel: "Medium",
    flagged: false
  },
  {
    sqlOperation: "JOIN",
    valkeyCommand: "N/A",
    dataStructure: "N/A",
    exampleCommand: "N/A",
    explanation: "UNSUPPORTED: Valkey is a key-value data structure store. It does not support relational JOINs natively. Data must be denormalized prior to insertion or joined in the application layer.",
    confidenceLevel: "None",
    flagged: true
  },
  {
    sqlOperation: "GROUP BY",
    valkeyCommand: "N/A",
    dataStructure: "N/A",
    exampleCommand: "N/A",
    explanation: "UNSUPPORTED: No direct equivalent. Requires maintaining pre-aggregated buckets manually using Hashes (e.g., using HINCRBY to track counts per group).",
    confidenceLevel: "None",
    flagged: true
  },
  {
    sqlOperation: "HAVING",
    valkeyCommand: "N/A",
    dataStructure: "N/A",
    exampleCommand: "N/A",
    explanation: "UNSUPPORTED: Must be filtered application-side after retrieving aggregates.",
    confidenceLevel: "None",
    flagged: true
  }
];

export default sqlToValkeyMappings;
