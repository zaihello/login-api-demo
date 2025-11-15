const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) return res.status(401).json({ message: '缺少 token' });

  const token = authHeader.split(' ')[1]; // Bearer token

  try {
    const decoded = jwt.verify(token, 'MY_SECRET_KEY');
    req.user = decoded; // 把解碼後資訊存到 req.user
    next(); // 驗證成功，進入下一個路由
  } catch (err) {
    return res.status(401).json({ message: 'Token 無效' });
  }
}

module.exports = authMiddleware;
