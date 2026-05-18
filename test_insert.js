import { pool } from './src/lib/db.ts';

const toCamelCase = (str) => str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
const toSnakeCase = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const objToCamel = (obj) => {
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

async function insert(table, data) {
    const keys = Object.keys(data).map(toSnakeCase);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    console.log("Q:", query);
    const res = await pool.query(query, values);
    return res.rows[0];
}

async function run() {
  const INITIAL_CONTRIBUTOR = { 
    name: "", 
    document: "", 
    type: "PJ", 
    status: "regular",
    processNumber: "",
    entryDate: "",
    tradeName: "",
    activity: "",
    category: "",
    razaoSocial: "",
    cnpj: "",
    responsible: "",
    cpf: "",
    technicalResponsible: "",
    technicalCouncil: "",
    street: "",
    block: "",
    quadra: "",
    number: "",
    neighborhood: "",
    responsibleOfficers: "",
    previousYear: "",
    damIssuance: "",
    damValue: "",
    licenseNumber: "",
    licenseIssuance: "",
    observation: "",
    contact: "",
    upload: ""
  };
  try {
     const inserted = await insert('contributors', INITIAL_CONTRIBUTOR);
     console.log(inserted);
  } catch (err) {
     console.error(err.message);
  }
  process.exit();
}
run();
