const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Ad alanı zorunludur']
    },
    lastName: {
        type: String,
        required: [true, 'Soyad alanı zorunludur']
    },
    username: {
        type: String,
        required: [true, 'Kullanıcı adı gerekli'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Email alanı zorunludur'],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir email adresi giriniz']
    },
    phone: {
        type: String,
        required: [true, 'Telefon alanı zorunludur']
    },
    password: {
        type: String,
        required: [true, 'Şifre gerekli'],
        minlength: 6,
        select: false
    },
    birthDate: {
        type: Date,
        required: [true, 'Doğum tarihi gerekli']
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    membershipType: {
        type: String,
        enum: ['standard', 'student', 'premium'],
        default: 'standard'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    activeCourses: [{
        name: String,
        startDate: Date,
        endDate: Date
    }],
    paidFees: [{
        amount: Number,
        date: Date,
        description: String
    }],
    pendingFees: [{
        amount: Number,
        date: Date,
        description: String
    }]
});

// Şifreyi hashleme
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Şifre kontrolü
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 