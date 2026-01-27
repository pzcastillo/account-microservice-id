const db = require('../db');

async function findAccountById(id) {
        const q = `
                SELECT 
                        a.id,
                        a.fullname,
                        a.username,
                        a.email,
                        a.department_id,
                        a.status,
                        a.role_id,
                        a.user_type_id,
                        ut.type_name AS user_type_name,
                        r.role_name AS role_name
                FROM accounts a
                LEFT JOIN user_types ut ON a.user_type_id = ut.id
                LEFT JOIN roles r ON a.role_id = r.id
                WHERE a.id = $1
        `;

        return db.query(q, [id]);
}

async function findAccountByUsernameOrEmail(usernameOrEmail) {
        const q = `
                SELECT 
                        a.id,
                        a.username,
                        a.email,
                        a.fullname,
                        a.password_hash,
                        a.status,
                        a.role_id,
                        a.user_type_id,
                        r.role_name,
                        ut.type_name AS user_type_name
                FROM accounts a
                LEFT JOIN roles r ON a.role_id = r.id
                LEFT JOIN user_types ut ON a.user_type_id = ut.id
                WHERE a.username = $1 OR a.email = $1
        `;

        return db.query(q, [usernameOrEmail]);
}

module.exports = {
        findAccountById,
        findAccountByUsernameOrEmail
};
