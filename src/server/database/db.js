const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  database: process.env.PGDATABASE,
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT || 5432
})

module.exports = pool