// Creates the database (if needed), the tables, and the demo data.
//
//   npm run db:setup     create everything; safe to run again
//   npm run db:reset     DELETE all data and start fresh
const path = require('path');
const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
const { pool, explainDbError, connectionString } = require('./index');
const { seed } = require('./seed');

const reset = process.argv.includes('--reset');

async function ensureDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) return; // PG* variables: assume the database exists
  const target = new URL(url);
  const dbName = decodeURIComponent(target.pathname.replace(/^\//, '')) || 'alliance_ai';
  const admin = new URL(url);
  admin.pathname = '/postgres';
  const client = new Client({ connectionString: admin.toString() });
  await client.connect();
  const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (!rowCount) {
    await client.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
    console.log(`Created database "${dbName}".`);
  }
  await client.end();
}

async function main() {
  console.log(`Connecting to ${String(connectionString).replace(/:[^:@/]*@/, ':****@')}`);
  await ensureDatabase();
  if (reset) {
    await pool.query(`DROP TABLE IF EXISTS user_state, study_rooms, thread_replies, threads, live_votes, live_sessions, pyqs,
      announcements, materials, question_bank, test_attempts, results_published, test_overrides, tests, submissions,
      assignments, files, course_sections, subjects, users CASCADE`);
    console.log('Removed all tables.');
  }
  await pool.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
  console.log('Tables are ready.');
  const summary = await seed(pool);
  console.log(summary);
  console.log('\nDone. Start the backend with "npm start".');
  console.log('Demo sign-ins (password Alliance@123):');
  console.log('  Faculty  demoteacher@alliance.edu.in');
  console.log('  Student  alex.sharma@alliance.edu.in   (section 5J)');
  console.log('  Student  demostudent@alliance.edu.in   (section 5K)');
}

main()
  .catch((err) => {
    console.error('\nDatabase setup failed:', explainDbError(err));
    process.exitCode = 1;
  })
  .finally(() => pool.end());
