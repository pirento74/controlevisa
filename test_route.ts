import { pool } from './src/lib/db.ts';

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

async function run() {
  const existingRows = await pool.query("SELECT * FROM gestao_de_dados LIMIT 1");
  const existingData = existingRows.rows[0] || {};
  
  const reqBody = { activities: ['NEW ENTRY'] };

  const saveData = {
      neighborhoods: JSON.stringify(reqBody.neighborhoods !== undefined ? reqBody.neighborhoods : formatSetting(existingData.neighborhoods)),
      officers: JSON.stringify(reqBody.officers !== undefined ? reqBody.officers : formatSetting(existingData.officers)),
      streets: JSON.stringify(reqBody.streets !== undefined ? reqBody.streets : formatSetting(existingData.streets)),
      functions: JSON.stringify(reqBody.functions !== undefined ? reqBody.functions : formatSetting(existingData.functions)),
      activities: JSON.stringify(reqBody.activities !== undefined ? reqBody.activities : formatSetting(existingData.activities)),
      years: JSON.stringify(reqBody.years !== undefined ? reqBody.years : formatSetting(existingData.years))
  };
  
  console.log('existingData', existingData);
  console.log('formatSetting neighborhoods', formatSetting(existingData.neighborhoods));
  console.log('saveData', saveData);
  pool.end();
}
run();
