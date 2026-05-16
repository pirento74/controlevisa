import express from 'express';
import { pool } from './src/lib/db.ts';

const app = express();
app.use(express.json());

const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

async function update(table: string, id: string, data: any) {
    const keys = Object.keys(data).map(toSnakeCase);
    const values = Object.values(data);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const query = `UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`;
    const res = await pool.query(query, [id, ...values]);
    return res.rows[0];
}

app.put("/test", async (req, res) => {
    try {
      const existingRows = await pool.query("SELECT * FROM gestao_de_dados LIMIT 1");
      const existingData = existingRows.rows[0] || {};
      
      console.log('existingData.neighborhoods:', existingData.neighborhoods);
      
      const saveData = {
          neighborhoods: JSON.stringify(req.body.neighborhoods !== undefined ? req.body.neighborhoods : (existingData.neighborhoods || [])),
          officers: JSON.stringify(req.body.officers !== undefined ? req.body.officers : (existingData.officers || [])),
          streets: JSON.stringify(req.body.streets !== undefined ? req.body.streets : (existingData.streets || [])),
          functions: JSON.stringify(req.body.functions !== undefined ? req.body.functions : (existingData.functions || [])),
          activities: JSON.stringify(req.body.activities !== undefined ? req.body.activities : (existingData.activities || [])),
          years: JSON.stringify(req.body.years !== undefined ? req.body.years : (existingData.years || []))
      };
      
      console.log('saveData:', saveData);
      
      let result;
      result = await update('gestao_de_dados', existingData.id, saveData);
      res.json(result);
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
});

const srv = app.listen(4000, async () => {
    const r1 = await fetch('http://localhost:4000/test', {
        method: 'PUT', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({neighborhoods: ['Z']})
    });
    console.log(await r1.json());
    
    const r2 = await fetch('http://localhost:4000/test', {
        method: 'PUT', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({officers: ['Officer 1']})
    });
    console.log(await r2.json());
    
    srv.close();
    pool.end();
});
