const db = require('../db');

async function createDepartment({ department_name, description, status }) {
  if (!department_name) throw new Error('department_name is required');

  const result = await db.query(
    `INSERT INTO departments (department_name, description, status)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [department_name, description || null, status || 'active']
  );

  return result.rows[0];
}

async function getAllDepartments() {
  const result = await db.query(
    `SELECT department_id, department_name, description, status, created_at, updated_at
     FROM departments
     ORDER BY created_at ASC`
  );
  return result.rows;
}

async function getDepartmentById(id) {
  const result = await db.query(
    `SELECT department_id, department_name, description, status, created_at, updated_at
     FROM departments
     WHERE department_id = $1`,
    [id]
  );
  return result.rows[0];
}

async function updateDepartment(id, { department_name, description, status }) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (department_name) {
    fields.push(`department_name = $${idx++}`);
    values.push(department_name);
  }
  if (description) {
    fields.push(`description = $${idx++}`);
    values.push(description);
  }
  if (status) {
    fields.push(`status = $${idx++}`);
    values.push(status);
  }

  if (fields.length === 0) throw new Error('No fields to update');

  values.push(id); // for WHERE clause
  const result = await db.query(
    `UPDATE departments SET ${fields.join(', ')}, updated_at = now() WHERE department_id = $${idx} RETURNING *`,
    values
  );

  return result.rows[0];
}

async function updateDepartmentStatus(id, status) {
  if (!status || !['active', 'inactive'].includes(status)) {
    throw new Error('status must be "active" or "inactive"');
  }

  const result = await db.query(
    `UPDATE departments SET status = $1, updated_at = now() WHERE department_id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
}

async function deleteDepartment(id) {
  await db.query(
    `DELETE FROM departments WHERE department_id = $1`,
    [id]
  );
}

module.exports = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  updateDepartmentStatus,
  deleteDepartment
};
