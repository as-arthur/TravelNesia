const { ValidationError } = require('../utils/error-handler');
const validatorMiddleware = {
  validateRegister: (req, res, next) => {
    try {
      const { username, email, password, fullName } = req.body;
      const errors = [];

      if (!username) {
        errors.push({ field: 'username', message: 'Username harus diisi' });
      } else if (username.length < 4 || username.length > 30) {
        errors.push({ field: 'username', message: 'Username harus antara 4-30 karakter' });
      }

      if (!email) {
        errors.push({ field: 'email', message: 'Email harus diisi' });
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.push({ field: 'email', message: 'Format email tidak valid' });
        }
      }

      if (!password) {
        errors.push({ field: 'password', message: 'Password harus diisi' });
      } else if (password.length < 6) {
        errors.push({ field: 'password', message: 'Password minimal 6 karakter' });
      }

      if (!fullName) {
        errors.push({ field: 'fullName', message: 'Nama lengkap harus diisi' });
      }

      if (errors.length > 0) {
        throw new ValidationError('Data tidak valid', errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  },

  validateLogin: (req, res, next) => {
    try {
      const { username, password } = req.body;
      const errors = [];

      if (!username) {
        errors.push({ field: 'username', message: 'Username harus diisi' });
      }

      if (!password) {
        errors.push({ field: 'password', message: 'Password harus diisi' });
      }

      if (errors.length > 0) {
        throw new ValidationError('Data tidak valid', errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  },

  validateUpdateProfile: (req, res, next) => {
    try {
      const { fullName, email, gender, dateOfBirth } = req.body;
      const errors = [];

      if (fullName !== undefined && !fullName) {
        errors.push({ field: 'fullName', message: 'Nama lengkap tidak boleh kosong' });
      }

      if (email !== undefined) {
        if (!email) {
          errors.push({ field: 'email', message: 'Email tidak boleh kosong' });
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            errors.push({ field: 'email', message: 'Format email tidak valid' });
          }
        }
      }

      if (gender !== undefined && gender !== null && !['male', 'female', 'other'].includes(gender)) {
        errors.push({ field: 'gender', message: 'Gender harus male, female, atau other' });
      }

      if (dateOfBirth !== undefined && dateOfBirth !== null) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateOfBirth)) {
          errors.push({ field: 'dateOfBirth', message: 'Format tanggal lahir tidak valid (YYYY-MM-DD)' });
        }
      }

      if (errors.length > 0) {
        throw new ValidationError('Data tidak valid', errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  },

  validateCreatePlace: (req, res, next) => {
    try {
      const { name, description, address, city, province, latitude, longitude, categories } = req.body;
      const errors = [];

      if (!name) {
        errors.push({ field: 'name', message: 'Nama tempat harus diisi' });
      }

      if (!description) {
        errors.push({ field: 'description', message: 'Deskripsi tempat harus diisi' });
      }

      if (!address) {
        errors.push({ field: 'address', message: 'Alamat harus diisi' });
      }

      if (!city) {
        errors.push({ field: 'city', message: 'Kota harus diisi' });
      }

      if (!province) {
        errors.push({ field: 'province', message: 'Provinsi harus diisi' });
      }

      if (latitude === undefined) {
        errors.push({ field: 'latitude', message: 'Latitude harus diisi' });
      } else {
        const lat = parseFloat(latitude);
        if (isNaN(lat) || lat < -90 || lat > 90) {
          errors.push({ field: 'latitude', message: 'Latitude harus antara -90 dan 90' });
        }
      }

      if (longitude === undefined) {
        errors.push({ field: 'longitude', message: 'Longitude harus diisi' });
      } else {
        const long = parseFloat(longitude);
        if (isNaN(long) || long < -180 || long > 180) {
          errors.push({ field: 'longitude', message: 'Longitude harus antara -180 dan 180' });
        }
      }

      if (!categories || !Array.isArray(categories) || categories.length === 0) {
        errors.push({ field: 'categories', message: 'Kategori harus diisi sebagai array' });
      }

      if (errors.length > 0) {
        throw new ValidationError('Data tidak valid', errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  },

  // Validasi untuk pemberian rating
  validateRating: (req, res, next) => {
    try {
      const { rating, review, visitDate } = req.body;
      const errors = [];

      // Validasi rating
      if (rating === undefined) {
        errors.push({ field: 'rating', message: 'Rating harus diisi' });
      } else {
        const ratingNum = parseInt(rating);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
          errors.push({ field: 'rating', message: 'Rating harus antara 1 dan 5' });
        }
      }

      // Validasi visitDate jika ada
      if (visitDate !== undefined && visitDate !== null) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(visitDate)) {
          errors.push({ field: 'visitDate', message: 'Format tanggal kunjungan tidak valid (YYYY-MM-DD)' });
        }
      }

      if (errors.length > 0) {
        throw new ValidationError('Data tidak valid', errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  }
};

module.exports = validatorMiddleware;