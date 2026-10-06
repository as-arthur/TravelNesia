/**
 * Validasi request memakai express-validator (sudah ada di package.json).
 * Semua error dikembalikan dengan format yang sama:
 *   { success: false, error: "<pesan pertama>", errors: [{ field, message }] }
 */
const { body, validationResult } = require('express-validator');

const PREFERENCE_CATEGORIES = [
  'Bahari',
  'Budaya',
  'Cagar Alam',
  'Pusat Perbelanjaan',
  'Taman Hiburan',
  'Tempat Ibadah',
  'Wisata Alam',
  'Wisata Budaya',
  'Wisata Hiburan',
  'Wisata Kuliner',
  'Wisata Petualangan'
];

const validate = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array().map((item) => ({
    field: item.path,
    message: item.msg
  }));

  return res.status(400).json({
    success: false,
    error: errors[0].message,
    errors
  });
};

const emailRule = body('email')
  .trim()
  .notEmpty().withMessage('Email tidak boleh kosong').bail()
  .isEmail().withMessage('Format email tidak valid')
  .customSanitizer((value) => value.toLowerCase());

exports.registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama tidak boleh kosong').bail()
    .isLength({ min: 2, max: 50 }).withMessage('Nama harus 2-50 karakter'),
  emailRule,
  body('password')
    .isString().withMessage('Password tidak boleh kosong').bail()
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  validate
];

exports.loginRules = [
  emailRule,
  body('password').notEmpty().withMessage('Password tidak boleh kosong'),
  validate
];

exports.reviewRules = [
  body('rating')
    .exists({ checkNull: true }).withMessage('Rating harus diisi').bail()
    .isInt({ min: 1, max: 5 }).withMessage('Rating harus berupa angka 1 sampai 5')
    .toInt(),
  body('text')
    .optional({ nullable: true })
    .isString().withMessage('Ulasan harus berupa teks')
    .trim()
    .isLength({ max: 1000 }).withMessage('Ulasan maksimal 1000 karakter'),
  validate
];

exports.reviewUpdateRules = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating harus berupa angka 1 sampai 5')
    .toInt(),
  body('text')
    .optional({ nullable: true })
    .isString().withMessage('Ulasan harus berupa teks')
    .trim()
    .isLength({ max: 1000 }).withMessage('Ulasan maksimal 1000 karakter'),
  validate
];

exports.profileRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Nama harus 2-50 karakter'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Format email tidak valid')
    .customSanitizer((value) => value.toLowerCase()),
  validate
];

exports.preferencesRules = [
  body('categories')
    .optional()
    .isArray().withMessage('Kategori harus berupa daftar'),
  body('categories.*')
    .isIn(PREFERENCE_CATEGORIES).withMessage('Kategori tidak dikenal'),
  body('priceRange.min')
    .optional()
    .isFloat({ min: 0 }).withMessage('Harga minimum tidak boleh negatif')
    .toFloat(),
  body('priceRange.max')
    .optional()
    .isFloat({ min: 0 }).withMessage('Harga maksimum tidak boleh negatif')
    .toFloat(),
  body('priceRange').custom((range) => {
    if (range && range.min !== undefined && range.max !== undefined && range.min > range.max) {
      throw new Error('Harga minimum tidak boleh lebih besar dari harga maksimum');
    }
    return true;
  }),
  body('location.city').optional({ nullable: true }).isString().trim(),
  body('location.province').optional({ nullable: true }).isString().trim(),
  validate
];

exports.changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Password saat ini harus diisi'),
  body('newPassword')
    .isString().withMessage('Password baru harus diisi').bail()
    .isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter'),
  validate
];

exports.PREFERENCE_CATEGORIES = PREFERENCE_CATEGORIES;
