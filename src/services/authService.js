const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

async function login({ usernameOrEmail, password }) {
  const q = `
    SELECT 
      a.id,
      a.username,
      a.email,
      a.fullname,
      a.password_hash,
      a.status,
      a.role_id,
      a.user_type_id,
      r.role_name,
      ut.type_name AS user_type_name
    FROM accounts a
    LEFT JOIN roles r ON a.role_id = r.id
    LEFT JOIN user_types ut ON a.user_type_id = ut.id
    WHERE a.username = $1 OR a.email = $1
  `;

  const r = await db.query(q, [usernameOrEmail]);

  if (r.rowCount === 0) throw { status: 401, message: 'Invalid credentials' };

  const user = r.rows[0];

  if (user.status !== 'active')
    throw { status: 403, message: 'Account is not active' };

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw { status: 401, message: 'Invalid credentials' };

  const tokenPayload = {
    sub: user.id,
    username: user.username,

    role_id: user.role_id,
    role_name: user.role_name,

    user_type_id: user.user_type_id,
    user_type_name: user.user_type_name
  };

  const token = jwt.sign(tokenPayload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,

      role_id: user.role_id,
      role_name: user.role_name,

      user_type_id: user.user_type_id,
      user_type_name: user.user_type_name
    }
  };
}

module.exports = { login };
