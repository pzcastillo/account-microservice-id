const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');

async function authenticate(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const token = auth.split(' ')[1];

  try {
    const payload = jwt.verify(token, config.jwt.secret);
    console.log('JWT payload:', payload);

    // Query includes role_id and user_type_id to fully populate req.user
    const q = `
      SELECT 
        a.id,
        a.fullname,
        a.username,
        a.email,
        a.department_id,
        a.status,
        a.role_id,
        a.user_type_id,
        ut.type_name AS user_type_name,
        r.role_name AS role_name
      FROM accounts a
      LEFT JOIN user_types ut ON a.user_type_id = ut.id
      LEFT JOIN roles r ON a.role_id = r.id
      WHERE a.id = $1
    `;

    const result = await db.query(q, [payload.sub]);
    console.log('DB query result:', result.rows);

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    const user = result.rows[0];

    user.role_name = user.role_name.toUpperCase();
    user.user_type_name = user.user_type_name.toUpperCase();

    req.user = user;

    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authenticate;
