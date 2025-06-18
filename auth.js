const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

const marketAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.userType !== 'market') {
        return res.status(403).json({ message: 'Acesso negado. Apenas mercados.' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Erro de autenticação' });
  }
};

module.exports = { auth, marketAuth };
