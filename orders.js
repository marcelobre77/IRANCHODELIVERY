const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Market = require('../models/Market');
const { auth, marketAuth } = require('../middleware/auth');

const router = express.Router();

// Criar pedido
router.post('/', auth, async (req, res) => {
  try {
    const {
      marketId,
      items,
      deliveryAddress,
      paymentMethod,
      notes
    } = req.body;

    // Verificar se o mercado existe
    const market = await Market.findById(marketId);
    if (!market) {
      return res.status(404).json({ message: 'Mercado não encontrado' });
    }

    // Verificar produtos e calcular total
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Produto ${item.productId} não encontrado` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });

      // Reduzir estoque
      product.stock -= item.quantity;
      await product.save();
    }

    // Verificar pedido mínimo
    if (subtotal < market.minimumOrder) {
      return res.status(400).json({
        message: `Pedido mínimo de R$ ${market.minimumOrder.to
