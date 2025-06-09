require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB bağlantısı başarılı'))
    .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Admin kullanıcı bilgileri
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'gizli-anahtar-123';

// MIME tipleri için express.static ayarları
const staticOptions = {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
        }
    }
};

// Statik dosyaları serve et
app.use(express.static(path.join(__dirname)));
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/styles.css', express.static(path.join(__dirname, 'styles.css')));
app.use('/*.js', express.static(path.join(__dirname)));

// HTML dosyaları için route'lar
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin-login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get('/personal-training.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'personal-training.html'));
});

app.get('/sporculara-ozel-antrenmanlar.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'sporculara-ozel-antrenmanlar.html'));
});

app.get('/ozel-grup-calismalari.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'ozel-grup-calismalari.html'));
});

// Admin girişi endpoint'i
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    console.log('Admin giriş denemesi:', { username, password });
    console.log('Beklenen:', { ADMIN_USERNAME, ADMIN_PASSWORD });

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
        console.log('Giriş başarılı, token oluşturuldu');
        res.json({
            success: true,
            token: token
        });
    } else {
        console.log('Giriş başarısız: Kullanıcı adı veya şifre hatalı');
        res.status(401).json({
            success: false,
            message: 'Geçersiz kullanıcı adı veya şifre'
        });
    }
});

// Admin middleware
const adminAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token bulunamadı'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bu işlem için yetkiniz yok'
            });
        }
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Geçersiz token'
        });
    }
};

// Admin API routes
app.get('/api/admin/users', adminAuth, async (req, res) => {
    try {
        const users = await User.find();
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.get('/api/admin/courses', adminAuth, async (req, res) => {
    try {
        const users = await User.find().select('username activeCourses');
        const courses = users.reduce((acc, user) => {
            return acc.concat(user.activeCourses.map(course => ({
                ...course.toObject(),
                username: user.username
            })));
        }, []);
        
        res.json({
            success: true,
            data: courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.delete('/api/admin/users/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }
        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// API routes
const User = require('./models/User');

// Kullanıcı kaydı
app.post('/api/register', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Kullanıcı girişi
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Geçersiz kullanıcı adı veya şifre'
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Geçersiz kullanıcı adı veya şifre'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Port ayarı
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
}); 