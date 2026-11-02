// PostgreSQL connection pool with Resilient In-Memory Fallback.
//
// Automatically connects to PostgreSQL if available via DATABASE_URL.
// If PostgreSQL is offline (e.g. hackathon demo environment without Postgres installed),
// it smoothly switches to the in-memory mock store seeded with Alliance University data.

const { Pool } = require('pg');
const { mockDb } = require('./mockDb');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });

let isPostgresAvailable = process.env.DATABASE_URL ? null : false;
const connectionString = process.env.DATABASE_URL || null;

let realPool = null;
if (process.env.DATABASE_URL) {
  try {
    realPool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10, connectionTimeoutMillis: 1500 });
    realPool.on('error', () => {
      isPostgresAvailable = false;
    });
  } catch {
    isPostgresAvailable = false;
  }
}

async function query(text, params) {
  if (isPostgresAvailable !== false && realPool) {
    try {
      const res = await realPool.query(text, params);
      isPostgresAvailable = true;
      return res;
    } catch {
      isPostgresAvailable = false;
      return mockDb.execute(text, params);
    }
  }
  return mockDb.execute(text, params);
}

// Pool wrapper that mirrors pg.Pool interface
const pool = {
  query: (text, params) => query(text, params),
  connect: async () => {
    if (isPostgresAvailable !== false && realPool) {
      try {
        const client = await realPool.connect();
        return client;
      } catch {
        isPostgresAvailable = false;
      }
    }
    return {
      query: (t, p) => mockDb.execute(t, p),
      release: () => {}
    };
  },
  end: async () => {
    if (realPool) {
      try {
        await realPool.end();
      } catch {
        /* ignore */
      }
    }
  }
};

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

function explainDbError(err) {
  if (isPostgresAvailable === false) return 'in-memory (fallback active)';
  const msg = err?.message || err?.code || String(err);
  if (err?.code === 'ECONNREFUSED') return 'in-memory (fallback active)';
  return msg;
}

module.exports = {
  pool,
  query,
  transaction,
  explainDbError,
  connectionString: connectionString || '(In-memory Mock Engine)',
  get isFallbackActive() {
    return isPostgresAvailable === false;
  }
};
