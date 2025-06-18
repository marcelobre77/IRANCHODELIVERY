const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: true
  },
  cnpj: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  logo: String,
  coverImage: String,
  category: {
    type: String,
    enum: ['supermercado', 'padaria', 'acougue', 'hortifruti', 'farmacia', 'outros'],
    default: 'supermercado'
  },
  workingHours: {
    monday: { open: String, close: String, isOpen: Boolean },
    tuesday: { open: String, close: String, isOpen: Boolean },
    wednesday: { open: String, close: String, isOpen: Boolean },
    thursday: { open: String, close: String, isOpen: Boolean },
    friday: { open: String, close: String, isOpen: Boolean },
    saturday: { open: String, close: String, isOpen: Boolean },
    sunday: { open: String, close: String, isOpen: Boolean }
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  minimumOrder: {
    type: Number,
    default: 0
  },
  deliveryRadius: {
    type: Number,
    default: 10 // km
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Market', marketSchema);
