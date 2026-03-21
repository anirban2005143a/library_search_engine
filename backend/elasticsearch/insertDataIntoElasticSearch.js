// const { Client } = require('@elastic/elasticsearch');
// const { Pool } = require('pg');
// const QueryStream = require('pg-query-stream');
// require('dotenv').config();

import { Client } from '@elastic/elasticsearch';
import { Pool } from 'pg';
import QueryStream from 'pg-query-stream';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go up directories to reach your .env
dotenv.config({
  path: path.resolve(__dirname, "../.env")  // adjust this path
});

// Setup Clients
export const esClient = new Client({
  node: 'https://localhost:9200', // Note the 'https'
  tls: {
    rejectUnauthorized: false // This tells Node to ignore the self-signed error
  },
  auth: {
    username: 'elastic',
    password: 'QT=SQW78hOfqJ9gPWsfc' // Check your terminal where you started ES
  }
});

const pgPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'books',
  password: String('2005@BengaliSwim'), 
  port: 5433,
});

async function basicMigration() {
  const indexName = 'books';

  try {
   // 1. Refresh the index (Delete if exists, then Create)
    const exists = await esClient.indices.exists({ index: indexName });

    if (exists) {
    await esClient.indices.delete({ index: indexName });
    console.log(`Old index "${indexName}" deleted.`);
    }

    await esClient.indices.create({ index: indexName });
    console.log(`Fresh index "${indexName}" created.`);

    const pgClient = await pgPool.connect();
    
    // 2. Query only the specific fields you requested
    const query = new QueryStream(`
      SELECT * FROM books
    `);
    const stream = pgClient.query(query);

    console.log('Migration started...');

    // 3. Use the Bulk Helper for raw insertion
    const result = await esClient.helpers.bulk({
      datasource: stream,
      onDocument(doc) {
        return { index: { _index: indexName } };
      },
      // Higher capacity for raw data transfer
      flushBytes: 5000000, 
      concurrency: 5
    });

    console.log(`Migration Complete:`);
    console.log(`- Successfully indexed: ${result.successful}`);
    console.log(`- Failed: ${result.failed}`);

    pgClient.release();
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pgPool.end();
  }
}

// basicMigration();