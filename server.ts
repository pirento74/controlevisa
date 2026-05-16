import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fsUtils from "fs";
import { pool } from "./src/lib/db.ts";
import { initDb } from "./src/lib/init_db.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(process.cwd(), "uploads");
if (!fsUtils.existsSync(uploadDir)) {
  fsUtils.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});
const upload = multer({ storage });

const toCamelCase = (str: string) => str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const objToCamel = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(v => objToCamel(v));
  if (obj !== null && typeof obj === 'object') {
    if (obj instanceof Date) return obj.toISOString();
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => {
        let cleanedValue = objToCamel(v);
        if (cleanedValue === null) cleanedValue = "";
        return [toCamelCase(k), cleanedValue];
      })
    );
  }
  return obj;
};

// Raw database query mapping utilities
async function insert(table: string, data: any) {
    const keys = Object.keys(data).map(toSnakeCase);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const res = await pool.query(query, values);
    return res.rows[0];
}

async function update(table: string, id: string, data: any) {
    const keys = Object.keys(data).map(toSnakeCase);
    const values = Object.values(data);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const query = `UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`;
    const res = await pool.query(query, [id, ...values]);
    return res.rows[0];
}

async function selectAll(table: string, orderBy = "created_at DESC") {
    const query = `SELECT * FROM ${table} ORDER BY ${orderBy}`;
    const res = await pool.query(query);
    return res.rows;
}

async function selectById(table: string, id: string) {
    const query = `SELECT * FROM ${table} WHERE id = $1`;
    const res = await pool.query(query, [id]);
    return res.rows[0];
}

async function deleteById(table: string, id: string) {
    const query = `DELETE FROM ${table} WHERE id = $1`;
    await pool.query(query, [id]);
}

async function startServer() {
  await initDb();
  
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  const ALL_PERMISSIONS = ["dashboard", "contribuintes", "saude", "reclamacoes", "producao", "impressos", "users", "alterar_cadastro", "dados", "forms"];

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const { rows } = await pool.query("SELECT * FROM users WHERE email = $1 AND password = $2", [email, password]);
      if (rows && rows.length > 0) {
        res.json({ success: true, user: objToCamel(rows[0]) });
      } else {
        if (email === "admin@exemplo.com" && password === "123") {
          res.json({ success: true, user: { id: "1", name: "Administrador", email: "admin@exemplo.com", role: "admin", permissions: ALL_PERMISSIONS } });
        } else {
          res.status(401).json({ success: false, message: "E-mail ou senha incorretos." });
        }
      }
    } catch(e) {
      if (email === "admin@exemplo.com" && password === "123") {
         res.json({ success: true, user: { id: "1", name: "Administrador", email: "admin@exemplo.com", role: "admin", permissions: ALL_PERMISSIONS } });
      } else {
         res.status(401).json({ success: false, message: "E-mail ou senha incorretos." });
      }
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const rows = await selectAll('users');
      res.json(objToCamel(rows));
    } catch (e: any) {
      res.json([{ id: "1", name: "Administrador", email: "admin@exemplo.com", role: "admin", permissions: ALL_PERMISSIONS }]);
    }
  });

  app.post("/api/users", async (req, res) => {
    const payload = { ...req.body };
    const finalPermissions = payload.role === "admin" ? ALL_PERMISSIONS : payload.permissions || ["dashboard"];
    const newUser = { 
      name: payload.name, email: payload.email, role: payload.role, 
      permissions: JSON.stringify(finalPermissions), password: payload.password 
    };
    try {
      const inserted = await insert('users', newUser);
      res.status(201).json(objToCamel(inserted));
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    await deleteById('users', req.params.id);
    res.status(204).send();
  });

  app.put("/api/users/:id", async (req, res) => {
    const payload = { ...req.body };
    const finalPermissions = payload.role === "admin" ? ALL_PERMISSIONS : payload.permissions || ["dashboard"];
    try {
      const updated = await update('users', req.params.id, {
        name: payload.name, email: payload.email, role: payload.role, 
        permissions: JSON.stringify(finalPermissions), password: payload.password
      });
      res.json(objToCamel(updated));
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/forms", async (req, res) => {
    try {
      const rows = await selectAll('forms');
      res.json(objToCamel(rows));
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/forms", async (req, res) => {
    const { id, ...rest } = req.body;
    const newForm = { date: new Date().toISOString().split('T')[0], ...rest };
    try {
      const inserted = await insert('forms', newForm);
      res.status(201).json(objToCamel(inserted));
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.delete("/api/forms/:id", async (req, res) => {
    await deleteById('forms', req.params.id);
    res.status(204).send();
  });

  app.get("/api/contributors", async (req, res) => {
    try {
      const rows = await selectAll('contributors');
      res.json(objToCamel(rows));
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/contributors", async (req, res) => {
    const { id, ...rest } = req.body;
    try {
      const inserted = await insert('contributors', rest);
      res.status(201).json(objToCamel(inserted));
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.put("/api/contributors/:id", async (req, res) => {
    const { id, createdAt, ...rest } = req.body;
    try {
      const updated = await update('contributors', req.params.id, rest);
      res.json(objToCamel(updated));
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.delete("/api/contributors/:id", async (req, res) => {
    await deleteById('contributors', req.params.id);
    res.status(204).send();
  });

  app.get("/api/health-wallets", async (req, res) => {
    try {
      const rows = await selectAll('health_wallets');
      res.json(objToCamel(rows));
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/health-wallets", async (req, res) => {
    const { id, ...rest } = req.body;
    try {
      const inserted = await insert('health_wallets', rest);
      res.status(201).json(objToCamel(inserted));
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.put("/api/health-wallets/:id", async (req, res) => {
    const { id, createdAt, ...rest } = req.body;
    try {
      const updated = await update('health_wallets', req.params.id, rest);
      res.json(objToCamel(updated));
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.delete("/api/health-wallets/:id", async (req, res) => {
    await deleteById('health_wallets', req.params.id);
    res.status(204).send();
  });

  app.get("/api/complaints", async (req, res) => {
    try {
      const rows = await selectAll('complaints');
      const parsedData = rows.map((row) => {
        let extra = {};
        try {
          if (row.subject && row.subject.startsWith('{')) {
            extra = JSON.parse(row.subject);
          } else {
            extra = { subject: row.subject };
          }
        } catch {
          extra = { subject: row.subject };
        }
        return {
          ...row,
          ...extra,
          reclamante_name: row.reporter_name
        };
      });
      res.json(objToCamel(parsedData));
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/complaints", async (req, res) => {
    const { id, reclamanteName, reporterName, subject, priority, status, date, createdAt, ...extraFields } = req.body;
    const subjectPayload = JSON.stringify({ subject, ...extraFields });
    try {
      const inserted = await insert('complaints', {
        reporter_name: reclamanteName || reporterName || "",
        subject: subjectPayload,
        priority: priority || "baixa",
        status: status || 'pendente',
        date: date || new Date().toISOString().split('T')[0]
      });
      res.status(201).json(objToCamel(inserted));
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.put("/api/complaints/:id", async (req, res) => {
    const { id, reclamanteName, reporterName, subject, priority, status, date, createdAt, ...extraFields } = req.body;
    const mapped: any = {};
    if (reclamanteName !== undefined || reporterName !== undefined) mapped.reporter_name = reclamanteName || reporterName;
    if (priority !== undefined) mapped.priority = priority;
    if (status !== undefined) mapped.status = status;
    if (date !== undefined) mapped.date = date;
    
    if (subject !== undefined || Object.keys(extraFields).length > 0) {
        mapped.subject = JSON.stringify({ subject, ...extraFields });
    }

    try {
      const updated = await update('complaints', req.params.id, mapped);
      res.json(objToCamel(updated));
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.delete("/api/complaints/:id", async (req, res) => {
    await deleteById('complaints', req.params.id);
    res.status(204).send();
  });

  app.get("/api/production", async (req, res) => {
    try {
      const rows = await selectAll('production_records');
      const parsedData = rows.map((row) => {
        let extra = {};
        try {
          if (row.sector && row.sector.startsWith('{')) {
            extra = JSON.parse(row.sector);
          }
        } catch { }
        return { ...row, ...extra };
      });
      res.json(objToCamel(parsedData));
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/production", async (req, res) => {
    const { id, quantity, location, neighborhood, observation, upload, officer, activity, date, status, ...rest } = req.body;
    const sectorPayload = JSON.stringify({ quantity, location, neighborhood, observation, upload, ...rest });
    try {
      const inserted = await insert('production_records', {
        officer: officer || "",
        activity: activity || "",
        sector: sectorPayload,
        status: status || 'em_andamento',
        date: date || new Date().toISOString().split('T')[0]
      });
      res.status(201).json(objToCamel(inserted));
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.put("/api/production/:id", async (req, res) => {
    const { id, quantity, location, neighborhood, observation, upload, officer, activity, date, status, createdAt, ...rest } = req.body;
    const mapped: any = {};
    if (officer !== undefined) mapped.officer = officer;
    if (activity !== undefined) mapped.activity = activity;
    if (status !== undefined) mapped.status = status;
    if (date !== undefined) mapped.date = date;
    
    if (quantity !== undefined || location !== undefined || neighborhood !== undefined || observation !== undefined || upload !== undefined || Object.keys(rest).length > 0) {
        mapped.sector = JSON.stringify({ quantity, location, neighborhood, observation, upload, ...rest });
    }

    try {
      const updated = await update('production_records', req.params.id, mapped);
      res.json(objToCamel(updated));
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.delete("/api/production/:id", async (req, res) => {
    await deleteById('production_records', req.params.id);
    res.status(204).send();
  });

  app.get("/api/prints", async (req, res) => {
    try {
      const rows = await selectAll('printed_matter');
      res.json(objToCamel(rows));
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });
  
  app.post("/api/prints", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Nenhum arquivo enviado." });
    
    try {
      const inserted = await insert('printed_matter', {
        name: req.file.originalname,
        size: (req.file.size / 1024 / 1024).toFixed(2) + " MB",
        type: req.file.mimetype,
        date: new Date().toISOString().split('T')[0],
        filename: req.file.filename
      });
      res.status(201).json(objToCamel(inserted));
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/prints/download/:id", async (req, res) => {
    try {
      const print = await selectById('printed_matter', req.params.id);
      if (!print || !print.filename) return res.status(404).send("Arquivo não encontrado.");
      
      const filePath = path.join(uploadDir, print.filename);
      if (fsUtils.existsSync(filePath)) {
        res.download(filePath, print.name);
      } else {
        res.status(404).send("Arquivo físico não encontrado no servidor.");
      }
    } catch(e: any) { res.status(500).send("Erro interno"); }
  });

  app.delete("/api/prints/:id", async (req, res) => {
    try {
      const row = await selectById('printed_matter', req.params.id);
      if (!row) return res.status(404).json({ message: "Registro não encontrado" });

      if (row.filename) {
        const filePath = path.join(uploadDir, row.filename);
        if (fsUtils.existsSync(filePath)) fsUtils.unlinkSync(filePath);
      }
      
      await deleteById('printed_matter', req.params.id);
      res.status(204).send();
    } catch(e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      const rows = await pool.query("SELECT * FROM gestao_de_dados LIMIT 1");
      const data = rows.rows[0];
      
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

      if (data) {
        res.json({
          id: data.id,
          neighborhoods: formatSetting(data.neighborhoods),
          officers: formatSetting(data.officers),
          streets: formatSetting(data.streets),
          functions: formatSetting(data.functions),
          activities: formatSetting(data.activities),
          years: formatSetting(data.years)
        });
      } else {
        res.json({});
      }
    } catch(e: any) { res.json({}); }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const existingRows = await pool.query("SELECT * FROM gestao_de_dados LIMIT 1");
      const existingData = existingRows.rows[0] || {};
      
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

      const saveData = {
          neighborhoods: JSON.stringify(req.body.neighborhoods !== undefined ? req.body.neighborhoods : formatSetting(existingData.neighborhoods)),
          officers: JSON.stringify(req.body.officers !== undefined ? req.body.officers : formatSetting(existingData.officers)),
          streets: JSON.stringify(req.body.streets !== undefined ? req.body.streets : formatSetting(existingData.streets)),
          functions: JSON.stringify(req.body.functions !== undefined ? req.body.functions : formatSetting(existingData.functions)),
          activities: JSON.stringify(req.body.activities !== undefined ? req.body.activities : formatSetting(existingData.activities)),
          years: JSON.stringify(req.body.years !== undefined ? req.body.years : formatSetting(existingData.years))
      };
      
      console.log('existingData.neighborhoods', existingData.neighborhoods);
      console.log('formatSetting =>', formatSetting(existingData.neighborhoods));
      console.log('saveData.neighborhoods', saveData.neighborhoods);
      
      let result;
      if (existingRows.rows.length > 0) {
         result = await update('gestao_de_dados', existingData.id, saveData);
      } else {
         result = await insert('gestao_de_dados', saveData);
      }
      res.json({
        id: result.id,
        neighborhoods: formatSetting(result.neighborhoods),
        officers: formatSetting(result.officers),
        streets: formatSetting(result.streets),
        functions: formatSetting(result.functions),
        activities: formatSetting(result.activities),
        years: formatSetting(result.years)
      });
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
