const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    numberOfRooms: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'paypal', 'bank_transfer'],
      default: 'credit_card',
    },
    // لا نخزن رقم البطاقة - فقط 4 أرقام أخيرة للمرجع
    cardLastFour: {
      type: String,
      maxlength: 4,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    guestDetails: [{
      name: {
        type: String,
        required: true,
      },
      age: {
        type: Number,
        required: true,
      },
      passportNumber: {
        type: String,
      }
    }],
    specialRequests: {
      type: String,
    },
    cancellationDate: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
    canCancel: {
      type: Boolean,
      default: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    review: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
      },
      reviewDate: {
        type: Date,
      }
    }
  },
  { timestamps: true }
);

// إنشاء transaction ID فريد
bookingSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;