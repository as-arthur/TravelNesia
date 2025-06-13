const mongoose = require('mongoose');

const PlaceSchema = new mongoose.Schema({
  name: {
  type: String,
  required: true,
  trim: true
},
  category: String,
  price: Number,
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Place', PlaceSchema);
