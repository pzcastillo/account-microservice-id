const db = require('../db');
const bcrypt = require('bcrypt');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

const {
    insertAccount,
    findById,
    findAll,
    updateById,
    setStatus,
    existsRole,
    existsUserType,
} = require('../repo/accountRepo');

async function createAccount({
    fullname,
    username,
    email,
    password,
    department_id = null,
    user_type_id = null,
    role_id = null,
    status = 'active'
}) {
    if (!password) {
        throw { status: 400, message: 'Password is required' };
    }

    if (role_id && !(await existsRole(role_id))) {
        throw { status: 400, message: 'Role not found' };
    }

    if (user_type_id && !(await existsUserType(user_type_id))) {
        throw { status: 400, message: 'User type not found' };
    }

    const password_hash = await bcrypt.hash(password, config.bcryptSaltRounds);
    const id = uuidv4();

    const account = await insertAccount({
        id,
        fullname,
        username,
        email,
        password_hash,
        department_id,
        user_type_id,
        role_id,
        status
    });

    if (!account) {
        throw { status: 500, message: 'Failed to create account' };
    }

    return account;
}

async function getAccountById(id) {
    return await findById(id);
}

async function listAccounts(filters = {}) {
    return await findAll(filters);
}

async function updateAccount(id, fields = {}) {
    const updates = { ...fields };

    if ('password' in fields && fields.password) {
        updates.password_hash = await bcrypt.hash(fields.password, config.bcryptSaltRounds);
        delete updates.password;
    }

    const updated = await updateById(id, updates);
    return updated || (await findById(id)); // return existing if no changes were made
}

async function disableAccount(id) {
    return await setStatus(id, 'disabled');
}

module.exports = {
    createAccount,
    getAccountById,
    listAccounts,
    updateAccount,
    disableAccount
};