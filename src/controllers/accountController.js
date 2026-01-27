const db = require('../db');
const accountService = require('../services/accountService');
const { deleteById } = require('../repo/accountRepo');

async function createAccount(req, res, next) {
    try {
        const body = req.body;
        const requester = req.user;

        // MANAGER can only create accounts in their own department
        if (requester.role_name === 'MANAGER') {
            body.department_id = requester.department_id;
        }

        // Only ADMIN/SUPER_ADMIN/MANAGER (own dept) can create
        if (
            requester.role_name !== 'SUPER_ADMIN' &&
            requester.role_name !== 'ADMIN' &&
            requester.role_name !== 'MANAGER'
        ) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const created = await accountService.createAccount(body);
        res.status(201).json(created);
    } catch (err) {
        next(err);
    }
}

async function listAccounts(req, res, next) {
    try {
        const { limit = 20, offset = 0, department_id, user_type_id, status } = req.query;
        const requester = req.user;

        // CLIENT & EMPLOYEE can only see their own account
        if (['EMPLOYEE', 'CLIENT'].includes(requester.role_name)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        let deptFilter = department_id;

        // MANAGER can only list own department accounts
        if (requester.role_name === 'MANAGER') {
            deptFilter = requester.department_id;
        }

        const accounts = await accountService.listAccounts({
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            department_id: deptFilter,
            user_type_id,
            status
        });

        res.json({ data: accounts, meta: { limit, offset } });
    } catch (err) {
        next(err);
    }
}

async function getAccount(req, res, next) {
    try {
        const id = req.params.id;
        const account = await accountService.getAccountById(id);
        if (!account) return res.status(404).json({ error: 'Account not found' });

        const requester = req.user;

        // EMPLOYEE and CLIENT can only view their own account
        if (
            (requester.role_name === 'EMPLOYEE' || requester.role_name === 'CLIENT') &&
            requester.id.toLowerCase() !== id.toLowerCase()
        ) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // MANAGER can only view accounts in their department
        if (requester.role_name === 'MANAGER' && account.department_id !== requester.department_id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        res.json(account);
    } catch (err) {
        next(err);
    }
}

async function updateAccount(req, res, next) {
    try {
        const id = req.params.id;
        const body = req.body;
        const requester = req.user;

        // EMPLOYEE and CLIENT can only update their own account
        if (['EMPLOYEE', 'CLIENT'].includes(requester.role_name) && requester.id !== id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // MANAGER can only update accounts in own department
        const target = await accountService.getAccountById(id);
        if (requester.role_name === 'MANAGER') {
            if (target.department_id !== requester.department_id) {
                return res.status(403).json({ error: 'Forbidden - cannot update outside your department' });
            }
            // Prevent MANAGER from moving account to another department
            if (body.department_id && body.department_id !== requester.department_id) {
                return res.status(403).json({ error: 'Forbidden - cannot change department' });
            }
        }

        const updated = await accountService.updateAccount(id, body);
        res.json(updated);
    } catch (err) {
        next(err);
    }
}

async function disableAccount(req, res, next) {
    try {
        const id = req.params.id;
        const requester = req.user;
        const target = await accountService.getAccountById(id);
        if (!target) return res.status(404).json({ error: 'Account not found' });

        // MANAGER can only disable accounts in own department
        if (requester.role_name === 'MANAGER' && target.department_id !== requester.department_id) {
            return res.status(403).json({ error: 'Forbidden - cannot disable outside your department' });
        }

        // EMPLOYEE and CLIENT cannot disable accounts
        if (['EMPLOYEE', 'CLIENT'].includes(requester.role_name)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const disabled = await accountService.disableAccount(id);
        res.json(disabled);
    } catch (err) {
        next(err);
    }
}

async function deleteAccount(req, res, next) {
    try {
        const { id } = req.params;
        const requester = req.user;
        const target = await accountService.getAccountById(id);

        if (!target) return res.status(404).json({ error: 'Account not found' });

        // MANAGER can only delete accounts in their department
        if (requester.role_name === 'MANAGER' && target.department_id !== requester.department_id) {
            return res.status(403).json({ error: 'Forbidden - cannot delete outside your department' });
        }

        // EMPLOYEE and CLIENT cannot delete accounts
        if (['EMPLOYEE', 'CLIENT'].includes(requester.role_name)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const deleted = await deleteById(id);           // ← now uses repo
        if (!deleted) {
            return res.status(404).json({ error: 'Account not found' });
        }

        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createAccount,
    listAccounts,
    getAccount,
    updateAccount,
    disableAccount,
    deleteAccount
};
