const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    packageType: {
      type: String,
      enum: ['family', 'honeymoon', 'adventure', 'cruise', 'luxury', 'business', 'budget'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: null, // للسعر قبل الخصم
    },
    discount: {
      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      startDate: {
        type: Date,
        default: null,
      },
      endDate: {
        type: Date,
        default: null,
      },
      isActive: {
        type: Boolean,
        default: false,
      }
    },
    availableRooms: {
      type: Number,
      required: true,
      min: 0,
    },
    totalRooms: {
      type: Number,
      required: true,
      min: 0,
    },
    ageRestriction: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 120,
      }
    },
    images: [{
      type: String,
    }],
    itinerary: {
      type: String,
    },
    included: [{
      type: String,
    }],
    excluded: [{
      type: String,
    }],
    waitingList: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
      position: {
        type: Number,
      }
    }],
    reviews: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      comment: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }
    }],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    bookingDeadline: {
      type: Number, // عدد الأيام قبل تاريخ البدء
      default: 7,
    },
    cancellationPolicy: {
      allowCancellation: {
        type: Boolean,
        default: true,
      },
      daysBeforeDeparture: {
        type: Number,
        default: 14, // يمكن الإلغاء قبل 14 يوم
      }
    },
    reminderDays: {
      type: Number,
      default: 5, // إرسال تذكير قبل 5 أيام
    },
  },
  { timestamps: true }
);

// حساب متوسط التقييم
packageSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = (sum / this.reviews.length).toFixed(1);
    this.totalReviews = this.reviews.length;
  }
};

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;