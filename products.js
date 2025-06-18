const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const Market = require('../models/Market');
const { auth, marketAuth } = require('../middleware/auth');

const router = express.Router();

// Configuração do multer para upload de imagens de produtos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

// Criar produto
router.post('/', marketAuth, upload.array('images', 5), async (req, res) => {
  try {
    const market = await Market.findOne({ user: req.user._id });
    if (!market) {
      return res.status(404).json({ message: 'Mercado não encontrado' });
    }

    const {
      name,
      description,
      price,
      originalPrice,
      category,
      subcategory,
      brand,
      unit,
      stock,
      isPromotion,
      promotionEndDate,
      nutritionalInfo
    } = req.body;

    const productData = {
      market: market._id,
      name,
      description,
      price: parseFloat(price),
      category,
      subcategory,
      brand,
      unit,
      stock: parseInt(stock) || 0,
      isPromotion: isPromotion === 'true',
      images: req.files ? req.files.map(file => file.filename) : []
    };

    if (originalPrice) {
      productData.originalPrice = parseFloat(originalPrice);
    }

    if (promotionEndDate) {
      productData.promotionEndDate = new Date(promotionEndDate);
    }

    if (nutritionalInfo) {
      productData.nutritionalInfo = JSON.parse(nutritionalInfo);
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      message: 'Produto criado com sucesso',
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
});

// Listar produtos
router.get('/', async (req, res) => {
  try {
    const {
      market,
      category,
      search,
      minPrice,
      maxPrice,
      isPromotion,
      page = 1,
      limit = 20
    } = req.query;

    let query = { isActive: true };

    if (market) {
      query.market = market;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (isPromotion === 'true') {
      query.isPromotion = true;
    }

    const products = await Product.find(query)
      .populate('market', 'businessName logo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter produto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('market', 'businessName logo rating deliveryFee minimumOrder');
    
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar produto
router.put('/:id', marketAuth, upload.array('images', 5), async (req, res) => {
  try {
    const market = await Market.findOne({ user: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, market: market._id });
    
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    const updateData = { ...req.body };
    
    if (req.body.price) {
      updateData.price = parseFloat(req.body.price);
    }

    if (req.body.originalPrice) {
      updateData.originalPrice = parseFloat(req.body.originalPrice);
    }

    if (req.body.stock) {
      updateData.stock = parseInt(req.body.stock);
    }

    if (req.body.isPromotion) {
      updateData.isPromotion = req.body.isPromotion === 'true';
    }

    if (req.body.nutritionalInfo) {
      updateData.nutritionalInfo = JSON.parse(req.body.nutritionalInfo);
    }

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.filename);
    }

    Object.assign(product, updateData);
    await product.save();

    res.json({
      message: 'Produto atualizado com sucesso',
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar produto
router.delete('/:id', marketAuth, async (req, res) => {
  try {
    const market = await Market.findOne({ user: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, market: market._id });
    
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    await product.deleteOne();

    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
