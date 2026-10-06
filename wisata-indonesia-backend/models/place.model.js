const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  text: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PlaceSchema = new mongoose.Schema({
  placeId: {
    type: Number,
    required: true,
    unique: true
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  category: {
    type: String,
    trim: true
  },

  city: {
    type: String,
    trim: true
  },

  price: {
    type: Number,
    default: 0
  },

  rating: {
    type: Number,
    default: 0
  },

  timeMinutes: {
    type: Number,
    default: 60
  },

  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },

  key: {
    type: String,
    trim: true
  },

  images: [String],

  // Sumber foto (artikel Wikipedia) agar kesesuaian foto bisa diperiksa
  imageSource: String,
  imageTitle: String,

  viewCount: {
    type: Number,
    default: 0
  },

  isFeatured: {
    type: Boolean,
    default: false
  },

  averageRating: {
    type: Number,
    default: 0
  },

  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  reviews: [ReviewSchema],

  createdAt: {
    type: Date,
    default: Date.now
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      // Daftar ID user yang memfavoritkan tidak boleh bocor ke publik: kirim jumlahnya saja.
      if (Array.isArray(ret.favorites)) {
        ret.favoritesCount = ret.favorites.length;
      }

      if (Array.isArray(ret.reviews)) {
        ret.reviewCount = ret.reviews.length;
        ret.userRating = ret.reviews.length
          ? Number((ret.reviews.reduce((sum, item) => sum + item.rating, 0) / ret.reviews.length).toFixed(1))
          : null;
      }

      delete ret.favorites;
      delete ret.__v;
      delete ret.user;

      return ret;
    }
  }
});

PlaceSchema.index({ location: '2dsphere' });
PlaceSchema.index({ category: 1, city: 1 });
PlaceSchema.index({ key: 1 });

module.exports = mongoose.model('Place', PlaceSchema);