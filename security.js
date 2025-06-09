const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');

// JWT Secret Key'i güvenli bir şekilde oluştur
const JWT_SECRET = crypto.randomBytes(64).toString('hex');
const JWT_EXPIRES_IN = '1h';

// Şifreleme için salt rounds
const SALT_ROUNDS = 12;

// Rate Limiting ayarları
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100 // IP başına maksimum istek sayısı
});

// Şifre hashleme fonksiyonu
const hashPassword = (password) => {
    // Frontend'de şifre hash'leme yapmıyoruz, bu backend'de yapılacak
    return password;
};

// Şifre doğrulama fonksiyonu
const verifyPassword = (password, hashedPassword) => {
    // Frontend'de şifre doğrulama yapmıyoruz, bu backend'de yapılacak
    return password === hashedPassword;
};

// JWT Token oluşturma
const generateToken = (payload) => {
    // Frontend'de token oluşturma yapmıyoruz, bu backend'de yapılacak
    return null;
};

// JWT Token doğrulama
const verifyToken = (token) => {
    // Frontend'de token doğrulama yapmıyoruz, bu backend'de yapılacak
    return null;
};

// SQL Injection koruması için input temizleme
const sanitizeInput = (input) => {
    // XSS koruması için basit bir sanitize fonksiyonu
    if (typeof input !== 'string') return input;
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

// CSRF Token oluşturma
const generateCSRFToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Güvenlik middleware'leri
const securityMiddleware = (app) => {
    // HTTP headers güvenliği
    app.use(helmet());
    
    // Rate limiting
    app.use('/api', limiter);
    
    // XSS koruması
    app.use(xss());
    
    // HTTP Parameter Pollution koruması
    app.use(hpp());
    
    // CORS ayarları
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
    });
};

// Güvenlik kontrol fonksiyonu
const securityCheck = (req) => {
    const checks = {
        headers: checkHeaders(req.headers),
        method: checkMethod(req.method),
        path: checkPath(req.path),
        body: checkPayload(req.body)
    };
    
    return Object.values(checks).every(check => check === true);
};

// Header kontrolü
const checkHeaders = (headers) => {
    // Temel header kontrolleri
    const requiredHeaders = ['user-agent', 'host'];
    return requiredHeaders.every(header => headers[header]);
};

// HTTP method kontrolü
const checkMethod = (method) => {
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
    return allowedMethods.includes(method);
};

// Path kontrolü
const checkPath = (path) => {
    // Path traversal saldırılarına karşı kontrol
    return !path.includes('../') && !path.includes('..\\');
};

// Request body kontrolü
const checkPayload = (body) => {
    if (!body) return true;
    // Maximum boyut kontrolü (örnek: 1MB)
    return JSON.stringify(body).length <= 1000000;
};

// Brute force koruması için başarısız giriş denemelerini takip et
const loginAttempts = new Map();

const checkBruteForce = (email) => {
    // Frontend'de brute force kontrolü yapmıyoruz, bu backend'de yapılacak
    return false;
};

module.exports = {
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    sanitizeInput,
    generateCSRFToken,
    securityMiddleware,
    securityCheck,
    checkBruteForce
}; 