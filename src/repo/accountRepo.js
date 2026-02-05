const db = require('../db');
const { v4: uuidv4 } = require('uuid');

async function insertAccount({
    id,
    fullname,
    username,
    email,
    password_hash,
    department_id = null,
    user_type_id = null,
    role_id = null,
    status = 'active'
}) {
    const query = `
        INSERT INTO accounts (id, fullname, username, email, password_hash, department_id, user_type_id, role_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, fullname, username, email, department_id, user_type_id, role_id, status, created_at, updated_at
    `;
    
    const values = [id, fullname, username, email, password_hash, department_id, user_type_id, role_id, status];
    const result = await db.query(query, values);
    return result.rows[0] || null;
}

async function findById(id) {
    const query = `
        SELECT id, fullname, username, email, department_id, user_type_id, role_id, status, created_at, updated_at
        FROM accounts 
        WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
}

async function findAll({ limit = 20, offset = 0, department_id, user_type_id, status } = {}) {
    const where = [];
    const params = [];
    let idx = 1;

    if (department_id) { where.push(`department_id = $${idx++}`); params.push(department_id); }
    if (user_type_id)  { where.push(`user_type_id  = $${idx++}`); params.push(user_type_id);  }
    if (status)        { where.push(`status       = $${idx++}`); params.push(status);        }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const query = `
        SELECT id, fullname, username, email, department_id, user_type_id, role_id, status, created_at, updated_at
        FROM accounts
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${idx++} OFFSET $${idx++}
    `;
    
    params.push(limit, offset);
    const result = await db.query(query, params);
    return result.rows;
}

async function updateById(id, fields) {
    const allowedFields = ['fullname', 'username', 'email', 'department_id', 'user_type_id', 'role_id', 'status', 'password_hash'];
    const sets = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(fields)) {
        if (!allowedFields.includes(key)) continue;
        sets.push(`${key} = $${idx++}`);
        values.push(value);
    }

    if (sets.length === 0) return null;

    sets.push(`updated_at = now()`);
    const query = `
        UPDATE accounts
        SET ${sets.join(', ')}
        WHERE id = $${idx}
        RETURNING id, fullname, username, email, department_id, user_type_id, role_id, status, created_at, updated_at
    `;
    values.push(id);

    const result = await db.query(query, values);
    return result.rows[0] || null;
}

async function setStatus(id, status) {
    const query = `
        UPDATE accounts
        SET status = $1, updated_at = now()
        WHERE id = $2
        RETURNING id, status, updated_at
    `;
    const result = await db.query(query, [status, id]);
    return result.rows[0] || null;
}

async function existsRole(id) {
    const result = await db.query('SELECT 1 FROM roles WHERE id = $1', [id]);
    return result.rowCount > 0;
}

async function existsUserType(id) {
    const result = await db.query('SELECT 1 FROM user_types WHERE id = $1', [id]);
    return result.rowCount > 0;
}

async function deleteById(id) {
    const result = await db.query(
        'DELETE FROM accounts WHERE id = $1 RETURNING id',
        [id]
    );
    return result.rowCount > 0;
}

module.exports = {
    insertAccount,
    findById,
    findAll,
    updateById,
    setStatus,
    existsRole,
    existsUserType,
    deleteById,
};
