import { pool } from './src/lib/db.ts';

async function runMigrations5() {
  const qContributors = `ALTER TABLE contributors ADD COLUMN IF NOT EXISTS license_validity VARCHAR(50);`;

  try {
    await pool.query(qContributors);
    console.log('Success:', qContributors);
  } catch (e) {
    console.error('Error on query contributors:', e.message);
  }

  pool.end();
}
runMigrations5();
