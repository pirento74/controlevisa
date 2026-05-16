import { pool } from './src/lib/db.ts';

const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

async function update(table: string, id: string, data: any) {
    const keys = Object.keys(data).map(toSnakeCase);
    const values = Object.values(data);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const query = `UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`;
    console.log('query', query);
    console.log('values', [id, ...values]);
    const res = await pool.query(query, [id, ...values]);
    return res.rows[0];
}

async function run() {
  const result1 = await update('gestao_de_dados', 'dd602c1b-c50f-45da-9146-127da2275be9', {
      neighborhoods: '["TEST 1", "TEST 2"]',
      activities: '[]'
  });
  console.log('result 1:', result1);
  
  const result2 = await update('gestao_de_dados', 'dd602c1b-c50f-45da-9146-127da2275be9', {
      neighborhoods: '["TEST 1", "TEST 2"]', // existing
      activities: '["NEW ACT"]'
  });
  console.log('result 2:', result2);

  const sel = await pool.query("SELECT * FROM gestao_de_dados");
  console.log('select again:', sel.rows[0]);
  pool.end();
}
run();
