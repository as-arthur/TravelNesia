const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Basic review info
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userAvatar: {
    type: String,
    default: ''
  },
  destinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    default: null // null means general review
  },
  
  // Review content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    maxlength: 100,
    default: ''
  },
  comment: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 500
  },
  visitDate: {
    type: Date,
    default: null
  },
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  
  // Images
  images: [{
    url: String,
    filename: String,
    size: Number
  }],
  
  // Voting system
  helpfulVotes: {
    type: Number,
    default: 0
  },
  notHelpfulVotes: {
    type: Number,
    default: 0
  },
  voterIds: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isHelpful: Boolean,
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Moderation
  isApproved: {
    type: Boolean,
    default: true
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportCount: {
    type: Number,
    default: 0
  },
  reportReasons: [{
    reason: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes untuk performance
reviewSchema.index({ destinationId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isApproved: 1, createdAt: -1 });

// Virtual untuk total votes
reviewSchema.virtual('totalVotes').get(function() {
  return this.helpfulVotes + this.notHelpfulVotes;
});

// Virtual untuk helpful percentage
reviewSchema.virtual('helpfulPercentage').get(function() {
  const total = this.totalVotes;
  if (total === 0) return 0;
  return (this.helpfulVotes / total * 100).toFixed(1);
});

// Methods
reviewSchema.methods.addVote = function(userId, isHelpful) {
  // Check if user already voted
  const existingVote = this.voterIds.find(vote => 
    vote.userId.toString() === userId.toString()
  );
  
  if (existingVote) {
    // Update existing vote
    if (existingVote.isHelpful !== isHelpful) {
      if (existingVote.isHelpful) {
        this.helpfulVotes -= 1;
        this.notHelpfulVotes += 1;
      } else {
        this.notHelpfulVotes -= 1;
        this.helpfulVotes += 1;
      }
      existingVote.isHelpful = isHelpful;
      existingVote.votedAt = new Date();
    }
  } else {
    // Add new vote
    if (isHelpful) {
      this.helpfulVotes += 1;
    } else {
      this.notHelpfulVotes += 1;
    }
    
    this.voterIds.push({
      userId: userId,
      isHelpful: isHelpful
    });
  }
  
  return this.save();
};

reviewSchema.methods.addReport = function(reason, reportedBy) {
  this.isReported = true;
  this.reportCount += 1;
  this.reportReasons.push({
    reason: reason,
    reportedBy: reportedBy
  });
  
  // Auto-hide if too many reports
  if (this.reportCount >= 5) {
    this.isApproved = false;
  }
  
  return this.save();
};

// Static methods
reviewSchema.statics.getStatistics = async function(destinationId = null) {
  const matchStage = {
    isApproved: true
  };
  
  if (destinationId) {
    matchStage.destinationId = mongoose.Types.ObjectId(destinationId);
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratings: { $push: '$rating' }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
  
  const result = stats[0];
  
  // Calculate rating distribution
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result.ratings.forEach(rating => {
    ratingDistribution[rating] += 1;
  });
  
  return {
    totalReviews: result.totalReviews,
    averageRating: Math.round(result.averageRating * 10) / 10,
    ratingDistribution: ratingDistribution
  };
};

module.exports = mongoose.model('Review', reviewSchema);