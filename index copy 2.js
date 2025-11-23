const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./authMiddleware');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// 允許解析 JSON
app.use(cors())
app.use(express.json());

// PostgreSQL 連線池
const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: { rejectUnauthorized: false } // Render 需要 SSL
});


// 模擬資料庫(之後改成 PostgreSQL)
const users = [];

// 註冊 API（含密碼加密）
app.post('/register', async(req, res) => {
  const { username, password } = req.body;

  // 檢查重複帳號
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: '使用者已存在' });
  }

  //密碼加密
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });

  res.json({ message: '註冊成功', users });
});

// 登入 API（含密碼驗證 + JWT）
app.post('/login', async(req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: '帳號或密碼錯誤' });

  //密碼比對
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: '帳號或密碼錯誤' });

  //產生 JWT Token
  const token = jwt.sign(
    { username },
    'MY_SECRET_KEY',
    { expiresIn: '2h' }
  );
  
  res.json({ message: '登入成功', token });
});

// // 測試 API（要帶 Token）
// app.get('/api/test',authMiddleware, (req, res) => {
//   res.json({ message: `API 運作正常！Hello ${req.user.username}` });
// });

// 會員資料（需要 Token）
app.get('/profile', authMiddleware, (req, res) => {
  res.json({ message: '這是會員資料', user: req.user });
});

// ------------------------------
// PostgreSQL 版本 CRUD: /members
// ------------------------------

app.get('/members', async (req, res) => {
  const result = await pool.query('SELECT * FROM members ORDER BY id ASC');
  res.json({message:'取得成功',members:result.rows});
});
app.post('/members', async (req, res) => {
  const { name, year } = req.body;
  
  const result = await pool.query(
    'INSERT INTO members (name, year) VALUES ($1, $2) RETURNING *',
    [name, year]
  );

  res.json({ message: '新增成功', member: result.rows[0] });
});
app.put('/members/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { name, year } = req.body;

  const result = await pool.query(
    'UPDATE members SET name=$1, year=$2 WHERE id=$3 RETURNING *',
    [name, year, id]
  );

  if (result.rows.length === 0) { 
    return res.status(404).json({ message: '找不到會員' });
  }  

  res.json({ message: '更新成功', member:result.rows[0] });
});
app.delete('/members/:id', async (req, res) => {
  const id = Number(req.params.id);
  await pool.query('DELETE FROM members WHERE id=$1', [id]);
  res.json({ message: '刪除成功' });
});


// 啟動伺服器
app.listen(PORT, () => {
  console.log(`伺服器運行中，http://localhost:${PORT}`);
});

