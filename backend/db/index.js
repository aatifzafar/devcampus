// PostgreSQL connection pool.
//
// Configure with DATABASE_URL in backend/.env, for example:
//   DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/alliance_ai
// (PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT also work.)
const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });

const DEFAULT_URL = 'postgres://postgres@localhost:5432/alliance_ai';
const connectionString = process.env.DATABASE_URL || (process.env.PGHOST || process.env.PGDATABASE ? undefined : DEFAULT_URL);

const pool = new Pool({ connectionString, max: 10 });

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err.message);
});

const query = (text, params) => pool.query(text, params);

// Run fn(client) inside BEGIN/COMMIT, rolling back on error.
async function transaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

// Friendly explanation for the most common connection problems.
function explainDbError(err) {
  const msg = err?.message || String(err);
  if (err?.code === 'ECONNREFUSED') return 'PostgreSQL is not running or not on that host/port. Start the PostgreSQL service, then try again.';
  if (err?.code === '28P01' || /password authentication failed/i.test(msg)) return 'Wrong PostgreSQL user or password. Check DATABASE_URL in backend/.env.';
  if (err?.code === '3D000') return 'The database does not exist yet. Run "npm run db:setup" in the backend folder.';
  if (err?.code === '42P01') return 'Tables are missing. Run "npm run db:setup" in the backend folder.';
  if (/client password must be a string/i.test(msg)) return 'No PostgreSQL password set. Put it in DATABASE_URL in backend/.env.';
  return msg;
}

module.exports = { pool, query, transaction, explainDbError, connectionString: connectionString || '(PG* environment variables)' };
