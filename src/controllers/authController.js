const authService = require('../services/authService');

async function login(req, res, next) {
  try {
    const { usernameOrEmail, password } = req.body;
    const result = await authService.login({ usernameOrEmail, password });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
