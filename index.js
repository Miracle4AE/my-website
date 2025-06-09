const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { securityMiddleware } = require('./security');
const path = require('path');

// MongoDB bağlantısı
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Güvenlik middleware'leri
securityMiddleware(app);

// Statik dosyalar
app.use(express.static('public'));

// API Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));

// Frontend route'ları için catch-all
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: err.message || 'Sunucu hatası'
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
}); 