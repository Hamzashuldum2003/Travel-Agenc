const mongoose = require('mongoose');

// نموذج لتقييمات تجربة الموقع (تظهر على الصفحة الرئيسية)
const websiteReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
    },
    category: {
      type: String,
      enum: ['booking_experience', 'payment_process', 'customer_service', 'website_usability', 'overall'],
      default: 'overall',
    },
    isApproved: {
      type: Boolean,
      default: false, // يحتاج موافقة الأدمن
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const WebsiteReview = mongoose.model('WebsiteReview', websiteReviewSchema);

module.exports = WebsiteReview;