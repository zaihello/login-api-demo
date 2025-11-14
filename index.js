const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// 允許解析 JSON
app.use(express.json());

// 模擬資料庫
const users = [];

// 註冊 API
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // 檢查重複帳號
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: '使用者已存在' });
  }

  users.push({ username, password });
  res.json({ message: '註冊成功', users });
});

// 登入 API
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: '帳號或密碼錯誤' });

  // 模擬 token
  const token = `fake-token-${Date.now()}`;
  res.json({ message: '登入成功', token });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`伺服器運行中，http://localhost:${PORT}`);
});
