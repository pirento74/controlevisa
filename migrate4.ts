import { pool } from './src/lib/db.ts';

async function runMigrations4() {
  const qForms = `ALTER TABLE forms ADD COLUMN IF NOT EXISTS upload VARCHAR(255);`;
  const qContributors = `ALTER TABLE contributors ADD COLUMN IF NOT EXISTS upload VARCHAR(255);`;
  const qComplaints = `ALTER TABLE complaints ADD COLUMN IF NOT EXISTS upload VARCHAR(255);`;
  const qComplaintsOther = `
    ALTER TABLE complaints 
    ADD COLUMN IF NOT EXISTS reclamante_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS reclamante_contact VARCHAR(255),
    ADD COLUMN IF NOT EXISTS reclamante_street VARCHAR(255),
    ADD COLUMN IF NOT EXISTS reclamante_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS reclamante_block VARCHAR(50),
    ADD COLUMN IF NOT EXISTS reclamante_quadra VARCHAR(50),
    ADD COLUMN IF NOT EXISTS reclamante_neighborhood VARCHAR(255),
    ADD COLUMN IF NOT EXISTS reclamado_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS reclamado_street VARCHAR(255),
    ADD COLUMN IF NOT EXISTS reclamado_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS reclamado_block VARCHAR(50),
    ADD COLUMN IF NOT EXISTS reclamado_quadra VARCHAR(50),
    ADD COLUMN IF NOT EXISTS reclamado_neighborhood VARCHAR(255);
  `;

  try {
    await pool.query(qForms);
    console.log('Success:', qForms);
  } catch (e) {
    console.error('Error on query forms:', e.message);
  }

  try {
    await pool.query(qContributors);
    console.log('Success:', qContributors);
  } catch (e) {
    console.error('Error on query contributors:', e.message);
  }

  try {
    await pool.query(qComplaints);
    console.log('Success:', qComplaints);
  } catch (e) {
    console.error('Error on query complaints:', e.message);
  }

  try {
    await pool.query(qComplaintsOther);
    console.log('Success:', qComplaintsOther);
  } catch (e) {
    console.error('Error on query complaints other:', e.message);
  }

  pool.end();
}
runMigrations4();
