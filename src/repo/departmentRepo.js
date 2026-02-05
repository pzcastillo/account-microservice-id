const db = require('../db');

async function insertDepartment({ department_name, description = null, status = 'active' }) {
    const query = `
        INSERT INTO departments (department_name, description, status)
        VALUES ($1, $2, $3)
        RETURNING department_id, department_name, description, status, created_at, updated_at
    `;
    const values = [department_name, description, status];

    const result = await db.query(query, values);
    return result.rows[0] || null;
}

async function findAll() {
    const query = `
        SELECT department_id, department_name, description, status, created_at, updated_at
        FROM departments
        ORDER BY created_at ASC
    `;
    const result = await db.query(query);
    return result.rows;
}

async function findById(id) {
    const query = `
        SELECT department_id, department_name, description, status, created_at, updated_at
        FROM departments
        WHERE department_id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
}

async function updateById(id, fields) {
    const allowed = ['department_name', 'description', 'status'];
    const sets = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(fields)) {
        if (!allowed.includes(key) || value === undefined) continue;
        sets.push(`${key} = $${idx++}`);
        values.push(value);
    }

    if (sets.length === 0) return null;

    sets.push('updated_at = now()');
    const query = `
        UPDATE departments
        SET ${sets.join(', ')}
        WHERE department_id = $${idx}
        RETURNING department_id, department_name, description, status, created_at, updated_at
    `;
    values.push(id);

    const result = await db.query(query, values);
    return result.rows[0] || null;
}

async function updateStatus(id, status) {
    const query = `
        UPDATE departments
        SET status = $1, updated_at = now()
        WHERE department_id = $2
        RETURNING department_id, department_name, description, status, created_at, updated_at
    `;
    const result = await db.query(query, [status, id]);
    return result.rows[0] || null;
}

async function removeById(id) {
    const result = await db.query(
        'DELETE FROM departments WHERE department_id = $1 RETURNING department_id',
        [id]
    );
    return result.rowCount > 0;
}

module.exports = {
    insertDepartment,
    findAll,
    findById,
    updateById,
    updateStatus,
    removeById
};