const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const controller = require('../controllers/accountController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const requirePermission = require('../middleware/permission');

/**
 * @swagger
 * tags:
 *   - name: Accounts
 *     description: Account management
 */

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Create a new account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - username
 *               - email
 *               - password
 *             properties:
 *               fullname:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               department_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: Optional department assignment (null = no department)
 *               role_id:
 *                 type: string
 *                 format: uuid
 *               user_type_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200: { description: Account created successfully }
 *       403: { description: Forbidden }
 */
router.post(
    '/',
    [
        authenticate,
        requirePermission(['accounts:create', 'accounts:create:own-dept']),
        body('fullname').notEmpty(),
        body('username').notEmpty(),
        body('email').isEmail(),
        body('password').isLength({ min: 8 }),
        validate
    ],
    controller.createAccount
);

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: List all accounts
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *       - in: query
 *         name: user_type_id
 *         schema:
 *           type: string
 *         description: Filter by user type ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by account status
 *     responses:
 *       200: { description: List of accounts }
 *       403: { description: Forbidden }
 */
router.get(
    '/',
    [
        authenticate,
        requirePermission(['accounts:read', 'accounts:read_own', 'accounts:read:own-dept'])
    ],
    controller.listAccounts
);

/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     summary: Get account by ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Account ID
 *     responses:
 *       200: { description: Account found }
 *       403: { description: Forbidden }
 *       404: { description: Account not found }
 */
router.get(
    '/:id',
    [
        authenticate,
        requirePermission(['accounts:read', 'accounts:read_own', 'accounts:read:own-dept']),
        param('id').isUUID()
    ],
    controller.getAccount
);

/**
 * @swagger
 * /accounts/{id}:
 *   put:
 *     summary: Update an account by ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200: { description: Account updated }
 *       403: { description: Forbidden }
 *       404: { description: Account not found }
 */
router.put(
    '/:id',
    [
        authenticate,
        requirePermission(['accounts:update', 'accounts:update_own', 'accounts:update:own-dept']),
        param('id').isUUID(),
        body('email').optional().isEmail(),
        body('password').optional().isLength({ min: 8 }),
        validate
    ],
    controller.updateAccount
);

/**
 * @swagger
 * /accounts/{id}/disable:
 *   post:
 *     summary: Disable (soft delete) an account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     responses:
 *       200: { description: Account disabled }
 *       403: { description: Forbidden }
 *       404: { description: Account not found }
 */
router.post(
    '/:id/disable',
    [
        authenticate,
        requirePermission(['accounts:disable', 'accounts:disable:own-dept']),
        param('id').isUUID()
    ],
    controller.disableAccount
);

/**
 * @swagger
 * /accounts/{id}:
 *   delete:
 *     summary: Delete an account (hard delete)
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     responses:
 *       200: { description: Account deleted }
 *       403: { description: Forbidden }
 *       404: { description: Account not found }
 */
router.delete(
    '/:id',
    [
        authenticate,
        requirePermission(['accounts:delete', 'accounts:delete:own-dept']),
        param('id').isUUID()
    ],
    controller.deleteAccount
);

module.exports = router;
