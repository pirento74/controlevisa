import { pool } from './src/lib/db.ts';

async function run() {
  try {
    const data2 = {
        neighborhoods: JSON.stringify(["Centro", "Batista"]),
        officers: JSON.stringify(["Joao"]),
        streets: JSON.stringify([]),
        functions: JSON.stringify([]),
        activities: JSON.stringify([]),
        years: JSON.stringify([]),
    };
    const keys = Object.keys(data2).join(', ');
    const vals = Object.values(data2);
    const pl = vals.map((_, i) => `$${i+1}`).join(', ');
    // Test insert
    await pool.query(`INSERT INTO gestao_de_dados (${keys}) VALUES (${pl})`, vals);
    
    const rows2 = await pool.query("SELECT * FROM gestao_de_dados LIMIT 1");
    console.log("Without stringify:", rows2.rows[0].neighborhoods, typeof rows2.rows[0].neighborhoods);

  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
