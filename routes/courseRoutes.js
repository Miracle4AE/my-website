const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');

// Tüm kursları getir
router.get('/', asyncHandler(async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.keyword
        ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i'
            }
        }
        : {};

    const count = await Course.countDocuments({ ...keyword });
    const courses = await Course.find({ ...keyword })
        .populate('instructor', 'name email')
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({
        courses,
        page,
        pages: Math.ceil(count / pageSize)
    });
}));

// Kurs detayı getir
router.get('/:id', asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id)
        .populate('instructor', 'name email');

    if (course) {
        res.json(course);
    } else {
        res.status(404);
        throw new Error('Kurs bulunamadı');
    }
}));

// Yeni kurs oluştur
router.post('/', protect, asyncHandler(async (req, res) => {
    const {
        name,
        description,
        price,
        duration,
        category,
        level,
        maxStudents,
        schedule
    } = req.body;

    const course = await Course.create({
        instructor: req.user._id,
        name,
        description,
        price,
        duration,
        category,
        level,
        maxStudents,
        schedule
    });

    if (course) {
        res.status(201).json(course);
    } else {
        res.status(400);
        throw new Error('Geçersiz kurs bilgileri');
    }
}));

// Kurs güncelle
router.put('/:id', protect, asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (course) {
        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Bu işlem için yetkiniz yok');
        }

        course.name = req.body.name || course.name;
        course.description = req.body.description || course.description;
        course.price = req.body.price || course.price;
        course.duration = req.body.duration || course.duration;
        course.category = req.body.category || course.category;
        course.level = req.body.level || course.level;
        course.maxStudents = req.body.maxStudents || course.maxStudents;
        course.schedule = req.body.schedule || course.schedule;
        course.isActive = req.body.isActive !== undefined ? req.body.isActive : course.isActive;

        const updatedCourse = await course.save();
        res.json(updatedCourse);
    } else {
        res.status(404);
        throw new Error('Kurs bulunamadı');
    }
}));

// Kursa kayıt ol
router.post('/:id/register', protect, asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (course) {
        if (course.currentStudents >= course.maxStudents) {
            res.status(400);
            throw new Error('Kurs kontenjanı dolu');
        }

        // Kullanıcının kursa daha önce kayıt olup olmadığını kontrol et
        const user = await User.findById(req.user._id);
        if (user.registeredCourses.includes(course._id)) {
            res.status(400);
            throw new Error('Bu kursa zaten kayıtlısınız');
        }

        // Kursa kayıt işlemi
        course.currentStudents += 1;
        await course.save();

        // Kullanıcının kurs listesine ekle
        user.registeredCourses.push(course._id);
        await user.save();

        res.json({ message: 'Kursa başarıyla kayıt oldunuz' });
    } else {
        res.status(404);
        throw new Error('Kurs bulunamadı');
    }
}));

// Kurstan çıkış yap
router.post('/:id/unregister', protect, asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (course) {
        // Kullanıcının kursa kayıtlı olup olmadığını kontrol et
        const user = await User.findById(req.user._id);
        if (!user.registeredCourses.includes(course._id)) {
            res.status(400);
            throw new Error('Bu kursa kayıtlı değilsiniz');
        }

        // Kurstan çıkış işlemi
        course.currentStudents -= 1;
        await course.save();

        // Kullanıcının kurs listesinden çıkar
        user.registeredCourses = user.registeredCourses.filter(
            courseId => courseId.toString() !== course._id.toString()
        );
        await user.save();

        res.json({ message: 'Kurstan başarıyla çıkış yaptınız' });
    } else {
        res.status(404);
        throw new Error('Kurs bulunamadı');
    }
}));

module.exports = router; 