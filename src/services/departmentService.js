const db = require('../db');

const {
    insertDepartment,
    findAll,
    findById,
    updateById,
    updateStatus,
    removeById,
} = require('../repo/departmentRepo');

async function createDepartment({ department_name, description, status }) {
    if (!department_name?.trim()) {
        throw { status: 400, message: 'department_name is required' };
    }

    const department = await insertDepartment({
        department_name: department_name.trim(),
        description: description?.trim() || null,
        status: status || 'active',
    });

    if (!department) {
        throw { status: 500, message: 'Failed to create department' };
    }

    return department;
}

async function getAllDepartments() {
    return await findAll();
}

async function getDepartmentById(id) {
    return await findById(id);
}

async function updateDepartment(id, fields = {}) {
    const updates = {};

    if ('department_name' in fields) {
        if (!fields.department_name?.trim()) {
            throw { status: 400, message: 'department_name cannot be empty' };
        }
        updates.department_name = fields.department_name.trim();
    }

    if ('description' in fields) {
        updates.description = fields.description?.trim() ?? null;
    }

    if ('status' in fields) {
        updates.status = fields.status;
    }

    if (Object.keys(updates).length === 0) {
        return await findById(id); // or throw if you prefer strict behavior
    }

    const updated = await updateById(id, updates);
    if (!updated) {
        throw { status: 404, message: 'Department not found' };
    }

    return updated;
}

async function updateDepartmentStatus(id, status) {
    if (!status || !['active', 'inactive'].includes(status)) {
        throw { status: 400, message: 'status must be "active" or "inactive"' };
    }

    const updated = await updateStatus(id, status);
    if (!updated) {
        throw { status: 404, message: 'Department not found' };
    }

    return updated;
}

async function deleteDepartment(id) {
    const deleted = await removeById(id);
    if (!deleted) {
        throw { status: 404, message: 'Department not found or already deleted' };
    }
}

module.exports = {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    updateDepartmentStatus,
    deleteDepartment
};
