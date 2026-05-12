const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'portal',
  password: process.env.DB_PASSWORD || 'portal',
  database: process.env.DB_NAME || 'portal',
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
