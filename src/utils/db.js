import pkg from "pg";
import { DATABASE, DB_PORT, HOST, PASSWORD, USER } from "../secret.js";
const { Pool } = pkg;

const db = new Pool({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATABASE,
  port: DB_PORT,
});

export default db;
