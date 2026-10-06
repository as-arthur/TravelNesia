const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getJwtSecret, jwtExpire } = require('../config/env');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama tidak boleh kosong'],
    trim: true,
    maxlength: [50, 'Nama tidak boleh lebih dari 50 karakter']
  },
  email: {
    type: String,
    required: [true, 'Email tidak boleh kosong'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Email tidak valid'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password tidak boleh kosong'],
    minlength: [6, 'Password minimal 6 karakter'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  preferences: {
    categories: {
  type: [String],
  enum: [
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
  ],
  default: []
},
    priceRange: {
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 1000000
      }
    },
    location: {
      province: String,
      city: String
    }
  },
  visitHistory: [{
    placeId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Place'
    },
    visitDate: {
      type: Date,
      default: Date.now
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  profileImage: {
    type: String,
    default: 'default.jpg'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password menggunakan bcrypt (hanya jika password diubah)
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT dan return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, getJwtSecret(), { expiresIn: jwtExpire });
};

// Data user yang aman dikirim ke frontend
UserSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    preferences: this.preferences
  };
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);