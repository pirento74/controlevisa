import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
});

// A helper for running queries easily
export const query = (text: string, params?: any[]) => pool.query(text, params);
