const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Market',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  originalPrice: Number,
  images: [String],
  category: {
    type: String,
    required: true
  },
  subcategory: String,
  brand: String,
  unit: {
    type: String,
    enum: ['kg', 'g', 'l', 'ml', 'un', 'pacote', 'caixa'],
    default: 'un'
  },
  stock: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPromotion: {
    type: Boolean,
    default: false
  },
  promotionEndDate: Date,
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
