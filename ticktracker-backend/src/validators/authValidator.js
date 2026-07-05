const { body, validationResult } = require('express-validator');


function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
}

const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama wajib diisi.')
    .isLength({ min: 2, max: 100 }).withMessage('Nama harus 2-100 karakter.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi.')
    .isEmail().withMessage('Format email tidak valid.')
    .isLength({ max: 255 }).withMessage('Email terlalu panjang.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6, max: 72 }).withMessage('Password harus 6-72 karakter.'),
  
  handleValidation,
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi.')
    .isEmail().withMessage('Format email tidak valid.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password wajib diisi.')
    .isLength({ max: 72 }).withMessage('Password tidak valid.'),
  handleValidation,
];

const updateProfileRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama gak boleh kosong.')
    .isLength({ min: 2, max: 100 }).withMessage('Nama harus 2-100 karakter.'),
  handleValidation,
];

module.exports = { registerRules, loginRules, updateProfileRules };
