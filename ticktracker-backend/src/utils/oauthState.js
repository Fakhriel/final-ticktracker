const jwt = require('jsonwebtoken');

function signOAuthState({ mode, userId = null }) {
  return jwt.sign({ mode, userId, nonce: Math.random().toString(36).slice(2) }, process.env.JWT_SECRET, {
    expiresIn: '5m',
  });
}

function verifyOAuthState(state) {
  return jwt.verify(state, process.env.JWT_SECRET);
}

module.exports = { signOAuthState, verifyOAuthState };