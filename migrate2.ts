import { pool } from './src/lib/db.ts';

async function runMigrations2() {
  const q = `ALTER TABLE production_records ALTER COLUMN sector TYPE TEXT;`;
  try {
    await pool.query(q);
    console.log('Success:', q);
  } catch (e) {
    console.error('Error on query:', q, e.message);
  }
  pool.end();
}
runMigrations2();
