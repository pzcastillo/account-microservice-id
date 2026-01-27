const jwt = require('jsonwebtoken');
const config = require('../config');
const { findAccountById } = require('../repo/accountRepo');

async function authenticate(req, res, next) {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing token' });
    }

    const token = auth.split(' ')[1];

    try {
        const payload = jwt.verify(token, config.jwt.secret);
        console.log('JWT payload:', payload);

        const result = await findAccountById(payload.sub);
        console.log('DB query result:', result.rows);

        if (result.rowCount === 0) {
            return res.status(401).json({ error: 'Invalid token - user not found' });
        }

        const user = result.rows[0];

        user.role_name = user.role_name.toUpperCase();
        user.user_type_name = user.user_type_name.toUpperCase();

        req.user = user;

        next();
    } catch (err) {
        console.error('Auth error:', err);
        return res.status(401).json({ error: 'Invalid token' });
    }
}

module.exports = authenticate;
