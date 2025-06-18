const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Rota de teste da API
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Irancho API funcionando!', 
        timestamp: new Date().toISOString() 
    });
});

// Conectar ao MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/irancho');
        console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    } catch (error) {
        console.log('❌ Erro ao conectar MongoDB:', error.message);
        console.log('⚠️ Continuando sem banco de dados...');
    }
};

// Iniciar servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor Irancho rodando na porta ${PORT}`);
    console.log(`🌐 Acesse: http://localhost:${PORT}`);
    connectDB();
});
