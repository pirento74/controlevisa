import { pool } from './src/lib/db.ts';

const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

async function update(table: string, id: string, data: any) {
    const keys = Object.keys(data).map(toSnakeCase);
    const values = Object.values(data);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const query = `UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`;
    const res = await pool.query(query, [id, ...values]);
    return res.rows[0];
}

const formatSetting = (val: any) => {
  if (!val) return [];
  if (typeof val === 'string') {
    try { 
      const parsed = JSON.parse(val); 
      return Array.isArray(parsed) ? parsed : [];
    } catch(e) { return []; }
  }
  return Array.isArray(val) ? val : [];
};

async function putLogic(reqBody: any) {
    const existingRows = await pool.query("SELECT * FROM gestao_de_dados LIMIT 1");
    const existingData = existingRows.rows[0] || {};
    
    console.log('existingData.neighborhoods:', existingData.neighborhoods);
    
    const saveData = {
        neighborhoods: JSON.stringify(reqBody.neighborhoods !== undefined ? reqBody.neighborhoods : formatSetting(existingData.neighborhoods)),
        officers: JSON.stringify(reqBody.officers !== undefined ? reqBody.officers : formatSetting(existingData.officers)),
        streets: JSON.stringify(reqBody.streets !== undefined ? reqBody.streets : formatSetting(existingData.streets)),
        functions: JSON.stringify(reqBody.functions !== undefined ? reqBody.functions : formatSetting(existingData.functions)),
        activities: JSON.stringify(reqBody.activities !== undefined ? reqBody.activities : formatSetting(existingData.activities)),
        years: JSON.stringify(reqBody.years !== undefined ? reqBody.years : formatSetting(existingData.years))
    };
    
    console.log('saveData.neighborhoods:', saveData.neighborhoods);
    
    const result = await update('gestao_de_dados', existingData.id, saveData);
    return result;
}

async function run() {
  await putLogic({ neighborhoods: ['NewB', 'NewC'] });
  const result = await putLogic({ activities: ['Act 99'] });
  console.log('Final from putLogic:', result);
  pool.end();
}
run();
