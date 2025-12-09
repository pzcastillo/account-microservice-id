const db = require('../db');
const accountService = require('../services/accountService');

function requirePermission(requiredPermissions) {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user?.role_id) return res.status(401).json({ error: 'Unauthorized' });

      const result = await db.query(
        'SELECT permissions, role_name FROM roles WHERE id = $1',
        [user.role_id]
      );
      if (result.rowCount === 0) return res.status(403).json({ error: 'Role not found' });

      const { permissions, role_name } = result.rows[0];
      req.user.role_name = role_name;

      // SUPER_ADMIN bypass
      if (role_name === 'SUPER_ADMIN') return next();

      const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

      const hasExact = (perm) => permissions.includes(perm);

      for (const reqPerm of required) {
        // 1. Exact match → full access
        if (hasExact(reqPerm)) return next();

        // 2. MANAGER: own department scope
        if (reqPerm === 'accounts:create' && hasExact('accounts:create:own-dept')) {
          if (req.body.department_id && req.body.department_id !== user.department_id) {
            return res.status(403).json({ error: 'Can only create accounts in your own department' });
          }
          return next();
        }

        if ((reqPerm === 'accounts:update' || reqPerm === 'accounts:disable' || reqPerm === 'accounts:delete') &&
            hasExact(reqPerm + ':own-dept')) {
          const targetId = req.params.id || req.body.id;
          if (!targetId) return res.status(403).json({ error: 'Target account ID required' });

          const account = await accountService.getAccountById(targetId);
          if (!account) return res.status(404).json({ error: 'Account not found' });
          if (account.department_id !== user.department_id) {
            return res.status(403).json({ error: 'Can only modify accounts in your own department' });
          }
          return next();
        }

        // 3. EMPLOYEE: own account only
        if ((reqPerm === 'accounts:read' || reqPerm === 'accounts:update') && 
            permissions.includes(reqPerm + '_own')) {
          const targetId = req.params.id || req.body.id || req.query.user_id;
          if (targetId && targetId !== user.id) {
            return res.status(403).json({ error: 'You can only access your own account' });
          }
          return next();
        }

        // 4. MANAGER can read own department (for list & get)
        if ((reqPerm === 'accounts:read' || reqPerm === 'accounts:read:own-dept') &&
            hasExact('accounts:read:own-dept')) {
          // For list: allow filtering by own dept, or no filter
          if (req.query.department_id && req.query.department_id !== user.department_id) {
            return res.status(403).json({ error: 'Can only view accounts in your own department' });
          }
          // For single get: check the account's department
          if (req.params.id) {
            const account = await accountService.getAccountById(req.params.id);
            if (account && account.department_id !== user.department_id) {
              return res.status(403).json({ error: 'Can only view accounts in your own department' });
            }
          }
          return next();
        }
      }

      return res.status(403).json({ error: 'Forbidden - insufficient permissions' });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = requirePermission;