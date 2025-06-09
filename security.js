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
const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

// Şifre doğrulama fonksiyonu
const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// JWT Token oluşturma
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

// JWT Token doğrulama
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// SQL Injection koruması için input temizleme
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    // SQL injection karakterlerini temizle
    return input.replace(/['";\\]/g, '');
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

const checkBruteForce = (ip) => {
    if (!loginAttempts.has(ip)) {
        loginAttempts.set(ip, {
            count: 0,
            firstAttempt: Date.now()
        });
        return true;
    }

    const attempt = loginAttempts.get(ip);
    const timeDiff = Date.now() - attempt.firstAttempt;

    // 15 dakika içinde 5 başarısız deneme limiti
    if (attempt.count >= 5 && timeDiff < 900000) {
        return false;
    }

    // 15 dakika geçtiyse sayacı sıfırla
    if (timeDiff >= 900000) {
        loginAttempts.set(ip, {
            count: 0,
            firstAttempt: Date.now()
        });
    }

    attempt.count++;
    return true;
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