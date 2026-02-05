const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { findAccountByUsernameOrEmail } = require('../repo/authRepo');

async function login({ usernameOrEmail, password }) {
    const r = await findAccountByUsernameOrEmail(usernameOrEmail);

    if (r.rowCount === 0) throw { status: 401, message: 'Invalid credentials' };

    const user = r.rows[0];

    if (user.status !== 'active')
        throw { status: 403, message: 'Account is not active' };

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw { status: 401, message: 'Invalid credentials' };

    const tokenPayload = {
        sub: user.id,
        username: user.username,
        role_id: user.role_id,
        role_name: user.role_name,
        user_type_id: user.user_type_id,
        user_type_name: user.user_type_name
    };

    const token = jwt.sign(tokenPayload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
    });

    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            fullname: user.fullname,
            email: user.email,

            role_id: user.role_id,
            role_name: user.role_name,

            user_type_id: user.user_type_id,
            user_type_name: user.user_type_name
        }
    };
}

module.exports = { login };
