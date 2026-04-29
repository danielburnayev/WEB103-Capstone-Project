import './loadEnv.js'
import pg from 'pg'

const config = {
  user: process.env.PGUSER || process.env.USER,
  password: process.env.PGPASSWORD ?? '',
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  database: process.env.PGDATABASE || 'postgres',
}

if (process.env.PGSSLMODE === 'require' || process.env.PGSSL === 'true') {
  config.ssl = { rejectUnauthorized: false }
}

export const pool = new pg.Pool(config)