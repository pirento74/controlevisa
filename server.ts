import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import { supabase } from "./src/lib/supabase-server.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});
const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Dados em memória para simular CRUD
  const ALL_PERMISSIONS = ["dashboard", "contribuintes", "saude", "reclamacoes", "producao", "impressos", "users", "dados", "forms"];

  let users = [
    { id: "1", name: "Administrador", email: "admin@exemplo.com", role: "admin", permissions: ALL_PERMISSIONS, password: "123" },
    { id: "2", name: "João Silva", email: "joao@exemplo.com", role: "editor", permissions: ["dashboard", "reclamacoes", "producao"], password: "123" }
  ];

  let forms = [
    { id: "1", title: "Pesquisa de Satisfação", description: "Avaliação semanal dos clientes.", status: "ativo", date: "2024-04-20" },
    { id: "2", title: "Inscrição de Evento", description: "Formulário para workshop de Maio.", status: "rascunho", date: "2024-04-21" }
  ];

  let contributors = [
    { id: "1", name: "Empresa de Alimentos LTDA", document: "12.345.678/0001-90", type: "PJ", status: "regular" },
    { id: "2", name: "Restaurante Central", document: "98.765.432/0001-10", type: "PJ", status: "pendente" }
  ];

  let healthWallets = [
    { id: "1", patientName: "Maria Souza", gender: "Feminino", birthDate: "1985-06-15", category: "Alimentação", expiration: "2025-06-15", status: "ativo" },
    { id: "2", patientName: "Carlos Lima", gender: "Masculino", birthDate: "1990-10-20", category: "Serviços", expiration: "2024-10-20", status: "vencido" }
  ];

  let complaints = [
    { id: "1", reporterName: "Ana Clara", subject: "Alimento Fora da Validade", priority: "alta", status: "pendente", date: "2024-04-21" },
    { id: "2", reporterName: "Felipe Melo", subject: "Falta de Higiene no Local", priority: "media", status: "em_analise", date: "2024-04-22" }
  ];

  let productionRecords = [
    { id: "1", activity: "Inspeção de Rotina", sector: "Industrial", officer: "Ricardo Dias", date: "2024-04-20", status: "concluido" },
    { id: "2", activity: "Coleta de Amostras", sector: "Comercial", officer: "Juliana Santos", date: "2024-04-21", status: "em_andamento" }
  ];

  let printedMatter = [
    { id: "1", name: "Formulário de Inspeção Sanitária.pdf", size: "1.2 MB", type: "application/pdf", date: "2024-04-15", filename: "" },
    { id: "2", name: "Guia de Procedimentos Técnicos.docx", size: "850 KB", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", date: "2024-04-16", filename: "" }
  ];

  const currentYear = new Date().getFullYear();
  let appSettings = {
    neighborhoods: [
      "Beira Rio", "Bela Vista", "Centro", "Cohab", "Colorado", "Getat",
      "Jardim Colorado", "Jardim Marilucy", "Jardim Paraíso", "Liberdade",
      "Mangal", "Maracanã", "Matinha", "Nova Brasília", "Nova Conquista",
      "Paracuri", "Pioneiro", "Santa Mônica", "São Francisco", "São Jorge",
      "Vila Tucuruí", "Outro"
    ],
    officers: [
      "Carlos Mendes", "Felipe Santos", "João Silva", "Maria Vieira", "Outro"
    ],
    streets: [
      "Av. Brasília", "Av. Castelo Branco", "Av. Veridenci", "Rua do Comércio", "Rua Lauro Sodré", "Rua Sete de Setembro", "Outro"
    ],
    functions: [],
    activities: [],
    years: ["Novo Estabelecimento", "Licenciado", "Não Licenciado"]
  };

  // API Routes
  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    // For users, maybe we use an in-memory or from 'users' table
    try {
      const { data: users, error } = await supabase.from('users').select('*').eq('email', email).eq('password', password);
      if (users && users.length > 0) {
        res.json({ success: true, user: objToCamel(users[0]) });
      } else {
        // Fallback to local admin
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
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      res.json(data ? objToCamel(data) : []);
    } catch (e) {
      res.json([{ id: "1", name: "Administrador", email: "admin@exemplo.com", role: "admin", permissions: ALL_PERMISSIONS }]);
    }
  });
  app.post("/api/users", async (req, res) => {
    const payload = { ...req.body };
    const finalPermissions = payload.role === "admin" ? ALL_PERMISSIONS : payload.permissions || ["dashboard"];
    const newUser = { 
      name: payload.name, email: payload.email, role: payload.role, 
      permissions: finalPermissions, password: payload.password 
    };
    const { data: insertedData, error } = await supabase.from('users').insert([objToSnake(newUser)]).select();
    if (error) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(insertedData ? objToCamel(insertedData[0]) : newUser);
  });
  app.delete("/api/users/:id", async (req, res) => {
    await supabase.from('users').delete().eq('id', req.params.id);
    res.status(204).send();
  });
  app.put("/api/users/:id", async (req, res) => {
    const payload = { ...req.body };
    const finalPermissions = payload.role === "admin" ? ALL_PERMISSIONS : payload.permissions || ["dashboard"];
    const { data, error } = await supabase.from('users').update(objToSnake({ 
      name: payload.name, email: payload.email, role: payload.role, 
      permissions: finalPermissions, password: payload.password 
    })).eq('id', req.params.id).select();
    if (error) return res.status(400).json(error);
    res.json(data ? objToCamel(data[0]) : payload);
  });

  app.get("/api/forms", async (req, res) => {
    const { data, error } = await supabase.from('forms').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data ? objToCamel(data) : []);
  });
  app.post("/api/forms", async (req, res) => {
    const { id, ...rest } = req.body;
    const newForm = { date: new Date().toISOString().split('T')[0], ...rest };
    const { data, error } = await supabase.from('forms').insert([objToSnake(newForm)]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data ? objToCamel(data[0]) : newForm);
  });
  app.delete("/api/forms/:id", async (req, res) => {
    const { error } = await supabase.from('forms').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.status(204).send();
  });

  const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  const toCamelCase = (str: string) => str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

  const objToSnake = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(v => objToSnake(v));
    if (obj !== null && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => {
          let cleanedValue = objToSnake(v);
          if (cleanedValue === "") cleanedValue = null;
          return [toSnakeCase(k), cleanedValue];
        })
      );
    }
    return obj;
  };

  const objToCamel = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(v => objToCamel(v));
    if (obj !== null && typeof obj === 'object') {
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

  app.get("/api/contributors", async (req, res) => {
    const { data } = await supabase.from('contributors').select('*').order('created_at', { ascending: false });
    res.json(data ? objToCamel(data) : []);
  });
  app.post("/api/contributors", async (req, res) => {
    const { id, ...rest } = req.body;
    const { data, error } = await supabase.from('contributors').insert([objToSnake(rest)]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data ? objToCamel(data[0]) : req.body);
  });
  app.put("/api/contributors/:id", async (req, res) => {
    const { id, ...rest } = req.body;
    const { data, error } = await supabase.from('contributors').update(objToSnake(rest)).eq('id', req.params.id).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data ? objToCamel(data[0]) : req.body);
  });
  app.delete("/api/contributors/:id", async (req, res) => {
    await supabase.from('contributors').delete().eq('id', req.params.id);
    res.status(204).send();
  });

  app.get("/api/health-wallets", async (req, res) => {
    const { data } = await supabase.from('health_wallets').select('*').order('created_at', { ascending: false });
    res.json(data ? objToCamel(data) : []);
  });
  app.post("/api/health-wallets", async (req, res) => {
    const { id, ...rest } = req.body;
    const { data, error } = await supabase.from('health_wallets').insert([objToSnake(rest)]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data ? objToCamel(data[0]) : req.body);
  });
  app.put("/api/health-wallets/:id", async (req, res) => {
    const { id, ...rest } = req.body;
    const { data, error } = await supabase.from('health_wallets').update(objToSnake(rest)).eq('id', req.params.id).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data ? objToCamel(data[0]) : req.body);
  });
  app.delete("/api/health-wallets/:id", async (req, res) => {
    await supabase.from('health_wallets').delete().eq('id', req.params.id);
    res.status(204).send();
  });

  app.get("/api/complaints", async (req, res) => {
    const { data } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    if (!data) return res.json([]);
    const parsedData = data.map((row: any) => {
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
  });
  app.post("/api/complaints", async (req, res) => {
    const { id, reclamanteName, reporterName, subject, priority, status, date, createdAt, ...extraFields } = req.body;
    const subjectPayload = JSON.stringify({ subject, ...extraFields });
    const mapped = {
        reporter_name: reclamanteName || reporterName || "",
        subject: subjectPayload,
        priority: priority || "baixa",
        status: status || 'pendente',
        date: date || new Date().toISOString().split('T')[0]
    };
    const { data, error } = await supabase.from('complaints').insert([mapped]).select();
    if (error) {
      console.error("Supabase Insert Error in complaints:", error);
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(data ? objToCamel(data[0]) : req.body);
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

    const { data, error } = await supabase.from('complaints').update(mapped).eq('id', req.params.id).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data ? objToCamel(data[0]) : req.body);
  });
  app.delete("/api/complaints/:id", async (req, res) => {
    await supabase.from('complaints').delete().eq('id', req.params.id);
    res.status(204).send();
  });

  app.get("/api/production", async (req, res) => {
    const { data } = await supabase.from('production_records').select('*').order('created_at', { ascending: false });
    if (!data) return res.json([]);
    const parsedData = data.map((row: any) => {
      let extra = {};
      try {
        if (row.sector && row.sector.startsWith('{')) {
          extra = JSON.parse(row.sector);
        }
      } catch {
        // ignore
      }
      return {
        ...row,
        ...extra,
      };
    });
    res.json(objToCamel(parsedData));
  });
  app.post("/api/production", async (req, res) => {
    const { id, quantity, location, neighborhood, observation, upload, officer, activity, date, status, ...rest } = req.body;
    const sectorPayload = JSON.stringify({ quantity, location, neighborhood, observation, upload, ...rest });
    const mapped = {
        officer: officer || "",
        activity: activity || "",
        sector: sectorPayload,
        status: status || 'em_andamento',
        date: date || new Date().toISOString().split('T')[0]
    };
    const { data, error } = await supabase.from('production_records').insert([mapped]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data ? objToCamel(data[0]) : req.body);
  });
  app.put("/api/production/:id", async (req, res) => {
    const { id, quantity, location, neighborhood, observation, upload, officer, activity, date, status, ...rest } = req.body;
    const mapped: any = {};
    if (officer !== undefined) mapped.officer = officer;
    if (activity !== undefined) mapped.activity = activity;
    if (status !== undefined) mapped.status = status;
    if (date !== undefined) mapped.date = date;
    
    if (quantity !== undefined || location !== undefined || neighborhood !== undefined || observation !== undefined || upload !== undefined || Object.keys(rest).length > 0) {
        mapped.sector = JSON.stringify({ quantity, location, neighborhood, observation, upload, ...rest });
    }

    const { data, error } = await supabase.from('production_records').update(mapped).eq('id', req.params.id).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data ? objToCamel(data[0]) : req.body);
  });
  app.delete("/api/production/:id", async (req, res) => {
    await supabase.from('production_records').delete().eq('id', req.params.id);
    res.status(204).send();
  });

  app.get("/api/prints", async (req, res) => {
    const { data } = await supabase.from('printed_matter').select('*').order('created_at', { ascending: false });
    res.json(data ? objToCamel(data) : []);
  });
  
  app.post("/api/prints", upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Nenhum arquivo enviado." });
    }
    
    const newPrint = {
      name: req.file.originalname,
      size: (req.file.size / 1024 / 1024).toFixed(2) + " MB",
      type: req.file.mimetype,
      date: new Date().toISOString().split('T')[0],
      filename: req.file.filename
    };
    
    // Save to supabase
    const { data, error } = await supabase.from('printed_matter').insert([objToSnake(newPrint)]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data ? objToCamel(data[0]) : newPrint);
  });

  app.get("/api/prints/download/:id", async (req, res) => {
    const { data } = await supabase.from('printed_matter').select('*').eq('id', req.params.id).single();
    const print = data ? objToCamel(data) : null;
    if (!print || !print.filename) {
      return res.status(404).send("Arquivo não encontrado.");
    }
    
    const filePath = path.join(uploadDir, print.filename);
    if (fs.existsSync(filePath)) {
      res.download(filePath, print.name);
    } else {
      res.status(404).send("Arquivo físico não encontrado no servidor.");
    }
  });

  app.delete("/api/prints/:id", async (req, res) => {
    const { data } = await supabase.from('printed_matter').select('*').eq('id', req.params.id).single();
    if (!data) return res.status(404).json({ message: "Registro não encontrado" });

    const print = objToCamel(data);
    if (print.filename) {
      const filePath = path.join(uploadDir, print.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await supabase.from('printed_matter').delete().eq('id', req.params.id);
    res.status(204).send();
  });

  app.get("/api/settings", async (req, res) => {
    const { data, error } = await supabase.from('gestao_de_dados').select('*').limit(1).single();
    if (data && !error) {
      res.json({
        id: data.id,
        neighborhoods: data.bairros || [],
        officers: data.fiscais_responsaveis || [],
        streets: data.rua_logradouro || [],
        functions: data.funcao || [],
        activities: data.atividade_realizada || [],
        years: data.anos_anteriores || []
      });
    } else {
      res.json(appSettings); // fallback
    }
  });

  app.put("/api/settings", async (req, res) => {
    appSettings = { ...appSettings, ...req.body };
    const saveData = {
        bairros: appSettings.neighborhoods || [],
        fiscais_responsaveis: appSettings.officers || [],
        rua_logradouro: appSettings.streets || [],
        funcao: appSettings.functions || [],
        atividade_realizada: appSettings.activities || [],
        anos_anteriores: appSettings.years || []
    };
    
    // First try to check if a row exists
    let { data: existingData } = await supabase.from('gestao_de_dados').select('id').limit(1).single();
    
    let result;
    if (existingData && existingData.id) {
       result = await supabase.from('gestao_de_dados').update(saveData).eq('id', existingData.id).select();
    } else {
       result = await supabase.from('gestao_de_dados').insert([saveData]).select();
    }
    
    if (result.error) return res.status(500).json({ error: result.error.message });
    
    const saved = result.data ? result.data[0] : null;
    if (saved) {
       res.json({
          id: saved.id,
          neighborhoods: saved.bairros || [],
          officers: saved.fiscais_responsaveis || [],
          streets: saved.rua_logradouro || [],
          functions: saved.funcao || [],
          activities: saved.atividade_realizada || [],
          years: saved.anos_anteriores || []
       });
    } else {
       res.json(appSettings);
    }
  });

  // Vite middleware for development
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
