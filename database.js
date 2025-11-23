// 專門管理 PostgreSQL 連線
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Render 必須加！
});

module.exports = pool;
