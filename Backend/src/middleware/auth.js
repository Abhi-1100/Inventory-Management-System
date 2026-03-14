const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Auth blocked: Missing or invalid header ->', authHeader);
    return res.status(401).json({ error: 'No token provided', code: 'UNAUTHORIZED' });
  }
  const token = authHeader.split(' ')[1];
  try {
    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET is not defined in environment!');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    console.error('Auth blocked: JWT verify failed ->', err.message);
    console.error('Token received (first 20 chars):', token ? token.substring(0, 20) + '...' : 'NONE');
    console.error('Token length:', token ? token.length : 0);
    return res.status(401).json({ error: 'Invalid or expired token', code: 'UNAUTHORIZED' });
  }
};

module.exports = { authenticate };
