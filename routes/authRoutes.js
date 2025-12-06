const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ensureAuth } = require('../middleware/authMiddleware');
const path = require('path'); 
const router = express.Router();

// الصفحة الرئيسية - توجيه للدخول إذا لم يكن مسجل دخول
router.get('/', (req, res) => {
  if (req.session && req.session.user) {
    return res.sendFile(path.join(__dirname, '../public/dashboard.html'));
  }
  res.redirect('/login');
});

// صفحة Dashboard محمية
router.get('/dashboard', ensureAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// صفحة التسجيل (GET)
router.get('/register', (req, res) => {
  // إذا كان مسجل دخول، وجهه للدشبورد
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, '../public/register.html'));
});

// معالجة التسجيل (POST)
router.post('/register', async (req, res) => {
  const { name, email, phone, address, dateOfBirth, password, confirmPassword } = req.body;

  try {
    // تحقق من الحقول الأساسية
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'رجاءً املأ جميع الحقول المطلوبة'
      });
    }

    // التحقق من طول الاسم
    if (name.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'الاسم يجب أن يكون 3 أحرف على الأقل'
      });
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'البريد الإلكتروني غير صالح'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'كلمات المرور غير متطابقة'
      });
    }

    // التحقق من قوة كلمة المرور
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
      });
    }

    // تحقق هل الإيميل موجود
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'هذا البريد الإلكتروني مُسجَّل مسبقًا'
      });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : undefined,
      address: address ? address.trim() : undefined,
      dateOfBirth: dateOfBirth || undefined,
      password: hashedPassword,
    });

    // حفظ المستخدم في الـ session
    req.session.user = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    // تحديد الصفحة المناسبة حسب نوع المستخدم
    const redirectUrl = newUser.role === 'admin' ? '/admin/dashboard' : '/dashboard';

    res.json({ 
      success: true, 
      redirect: redirectUrl,
      message: 'تم إنشاء حسابك بنجاح'
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى'
    });
  }
});

// صفحة تسجيل الدخول (GET)
router.get('/login', (req, res) => {
  // إذا كان مسجل دخول، وجهه للدشبورد
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// معالجة تسجيل الدخول (POST)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'رجاءً أدخل الإيميل وكلمة المرور'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'مستخدم غير موجود'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'كلمة المرور غير صحيحة'
      });
    }

    // حفظ المستخدم في الـ session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ، حاول مرة أخرى'
    });
  }
});

// تسجيل الخروج
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// API للحصول على معلومات المستخدم
router.get('/api/user', ensureAuth, (req, res) => {
  res.json({
    success: true,
    user: req.session.user
  });
});

module.exports = router;