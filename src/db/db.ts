import pg from "pg";
import { PGDATABASE_STRING, PGHOST_STRING, PGPASSWORD_STRING, PGPORT_, PGUSER_STRING } from "../constants.js";
import dotenv from 'dotenv';
dotenv.config();  // lädt die Umgebungsvariablen aus der .env-Datei

const { Client, Pool } = pg;

let client: null | pg.Client = null;
let pool: null | pg.Pool = null;

export function getClient() {
  if (client) {
    return client;
  }
  client = new Client({
    host: PGHOST_STRING,
    port: 5432,
    user: PGUSER_STRING,
    password: PGPASSWORD_STRING,
    database: PGDATABASE_STRING,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  return client;
}

export function getPool() {
  if (pool) {
    return pool;
  }
  pool = new Pool({
    host: PGHOST_STRING,
    port: 5432,
    user: PGUSER_STRING,
    password:PGPASSWORD_STRING,
    database: PGDATABASE_STRING,
    max: 20,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  return pool;
}
