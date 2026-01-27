const deptService = require('../services/departmentService');

async function create(req, res) {
    try {
        const dept = await deptService.createDepartment(req.body);
        res.status(201).json(dept);
    } catch (err) {
        console.error('Error creating department:', err.message, 'Body:', req.body);
        res.status(400).json({ error: err.message });
    }
}

async function getAll(req, res) {
    try {
        const depts = await deptService.getAllDepartments();
        res.json(depts);
    } catch (err) {
        console.error('Error fetching departments:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getById(req, res) {
    try {
        const dept = await deptService.getDepartmentById(req.params.id);
        if (!dept) return res.status(404).json({ error: 'Department not found' });
        res.json(dept);
    } catch (err) {
        console.error('Error fetching department by ID:', err.message, 'ID:', req.params.id);
        res.status(400).json({ error: err.message });
    }
}

async function update(req, res) {
    try {
        const dept = await deptService.updateDepartment(req.params.id, req.body);
        res.json(dept);
    } catch (err) {
        console.error('Error updating department:', err.message, 'Body:', req.body, 'ID:', req.params.id);
        res.status(400).json({ error: err.message });
    }
}

async function updateStatus(req, res) {
    try {
        const dept = await deptService.updateDepartmentStatus(req.params.id, req.body.status);
        res.json(dept);
    } catch (err) {
        console.error('Error updating department status:', err.message, 'Status:', req.body.status, 'ID:', req.params.id);
        res.status(400).json({ error: err.message });
    }
}

async function remove(req, res) {
    try {
        await deptService.deleteDepartment(req.params.id);
        res.status(204).send();
    } catch (err) {
        console.error('Error deleting department:', err.message, 'ID:', req.params.id);
        res.status(400).json({ error: err.message });
    }
}

module.exports = { create, getAll, getById, update, updateStatus, remove };
