const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Kurs adı zorunludur'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Kurs açıklaması zorunludur']
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        type: Number,
        required: [true, 'Kurs ücreti zorunludur']
    },
    duration: {
        type: Number, // Dakika cinsinden
        required: [true, 'Kurs süresi zorunludur']
    },
    category: {
        type: String,
        required: [true, 'Kategori zorunludur'],
        enum: ['Futbol', 'Basketbol', 'Beyzbol', 'Su Topu', 'Yüzme', 'Tenis', 'Masa Tenisi', 'Voleybol']
    },
    level: {
        type: String,
        required: [true, 'Seviye zorunludur'],
        enum: ['Başlangıç', 'Orta', 'İleri']
    },
    maxStudents: {
        type: Number,
        required: [true, 'Maksimum öğrenci sayısı zorunludur']
    },
    currentStudents: {
        type: Number,
        default: 0
    },
    schedule: [{
        day: {
            type: String,
            required: true,
            enum: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
        },
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Sanal alan: Kurs doluluk oranı
courseSchema.virtual('occupancyRate').get(function() {
    return (this.currentStudents / this.maxStudents) * 100;
});

// Middleware: Öğrenci sayısı kontrolü
courseSchema.pre('save', function(next) {
    if (this.currentStudents > this.maxStudents) {
        next(new Error('Mevcut öğrenci sayısı maksimum kapasiteyi aşamaz'));
    }
    next();
});

module.exports = mongoose.model('Course', courseSchema); 