const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place',
    required: true
  },
  visitDate: {
    type: Date,
    required: true
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Visit', VisitSchema);
