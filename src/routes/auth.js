const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const router = express.Router();
const controller = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 *
 * /auth/login:
 *   post:
 *     summary: Authenticate user and return JWT token
 *     description: Logs in a user using username/email and password. On success, returns a JWT token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usernameOrEmail
 *               - password
 *             properties:
 *               usernameOrEmail:
 *                 type: string
 *                 example: johndoe or john@example.com
 *                 description: Username or email address
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MySecurePass123
 *                 description: User password
 *     responses:
 *       200:
 *         description: Login successful - JWT token returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 message:
 *                   type: string
 *                   example: Login successful
 *       400:
 *         description: Validation error (missing/invalid fields)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.post('/login', 
    [
        body('usernameOrEmail')
            .notEmpty()
            .withMessage('usernameOrEmail is required')
            .trim(),
        body('password')
            .notEmpty()
            .withMessage('password is required'),
        validate
    ],
    controller.login
);

module.exports = router;
