const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// 允許解析 JSON
app.use(cors())
app.use(express.json());

// 模擬資料庫
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

// 受保護的路由
app.get('/profile', authMiddleware, (req, res) => {
  res.json({ message: '這是會員資料', user: req.user });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`伺服器運行中，http://localhost:${PORT}`);
});
