const db = require('../db');
const bcrypt = require('bcrypt');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

async function createAccount({
  fullname,
  username,
  email,
  password,
  department_id = null,
  user_type_id = null,
  role_id = null,
  status = 'active'
}) {
  if (!password) throw { status: 400, message: 'Password is required' };

  // Validate role exists
  if (role_id) {
    const roleCheck = await db.query('SELECT id FROM roles WHERE id = $1', [role_id]);
    if (roleCheck.rowCount === 0) throw { status: 400, message: 'Role not found' };
  }

  // Validate user type exists
  if (user_type_id) {
    const userTypeCheck = await db.query('SELECT id FROM user_types WHERE id = $1', [user_type_id]);
    if (userTypeCheck.rowCount === 0) throw { status: 400, message: 'User type not found' };
  }

  const hash = await bcrypt.hash(password, config.bcryptSaltRounds);
  const id = uuidv4();

  const q = `
    INSERT INTO accounts (id, fullname, username, email, password_hash, department_id, user_type_id, role_id, status)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING id, fullname, username, email, department_id, user_type_id, role_id, status, created_at, updated_at
  `;
  const values = [id, fullname, username, email, hash, department_id, user_type_id, role_id, status];
  const r = await db.query(q, values);
  return r.rows[0];
}

async function getAccountById(id) {
  const q = `
    SELECT id, fullname, username, email, department_id, user_type_id, role_id, status, created_at, updated_at
    FROM accounts WHERE id = $1
  `;
  const r = await db.query(q, [id]);
  return r.rows[0] || null;
}

async function listAccounts({ limit = 20, offset = 0, department_id, user_type_id, status }) {
  const where = [];
  const params = [];
  let idx = 1;

  if (department_id) { where.push(`department_id = $${idx++}`); params.push(department_id); }
  if (user_type_id) { where.push(`user_type_id = $${idx++}`); params.push(user_type_id); }
  if (status) { where.push(`status = $${idx++}`); params.push(status); }

  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const q = `
    SELECT id, fullname, username, email, department_id, user_type_id, role_id, status, created_at, updated_at
    FROM accounts ${whereSQL}
    ORDER BY created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  params.push(limit, offset);
  const r = await db.query(q, params);
  return r.rows;
}

async function updateAccount(id, fields = {}) {
  const allowed = ['fullname', 'username', 'email', 'department_id', 'user_type_id', 'role_id', 'status', 'password'];
  const sets = [];
  const values = [];
  let idx = 1;

  for (const k of Object.keys(fields)) {
    if (!allowed.includes(k)) continue;
    if (k === 'password') {
      const hash = await bcrypt.hash(fields.password, config.bcryptSaltRounds);
      sets.push(`password_hash = $${idx++}`);
      values.push(hash);
    } else {
      sets.push(`${k} = $${idx++}`);
      values.push(fields[k]);
    }
  }

  if (sets.length === 0) return getAccountById(id);

  sets.push(`updated_at = now()`);
  const q = `
    UPDATE accounts SET ${sets.join(', ')}
    WHERE id = $${idx}
    RETURNING id, fullname, username, email, department_id, user_type_id, role_id, status, created_at, updated_at
  `;
  values.push(id);

  const r = await db.query(q, values);
  return r.rows[0];
}

async function disableAccount(id) {
  const q = `
    UPDATE accounts
    SET status = 'disabled', updated_at = now()
    WHERE id = $1
    RETURNING id, status, updated_at
  `;
  const r = await db.query(q, [id]);
  return r.rows[0];
}

module.exports = {
  createAccount,
  getAccountById,
  listAccounts,
  updateAccount,
  disableAccount
};