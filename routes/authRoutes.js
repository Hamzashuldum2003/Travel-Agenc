const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ensureAuth } = require('../middleware/authMiddleware');
const path = require('path'); 
const router = express.Router();

// الصفحة الرئيسية (Home) – محمية
router.get('/', ensureAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});


// صفحة التسجيل (GET)
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/register.html'));
});


// معالجة التسجيل (POST)
router.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    // تحقق من الحقول
    if (!name || !email || !password || !confirmPassword) {
      return res.render('register', {
        title: 'Register',
        error: 'رجاءً عبّي كل الحقول',
      });
    }

    if (password !== confirmPassword) {
      return res.render('register', {
        title: 'Register',
        error: 'كلمات المرور غير متطابقة',
      });
    }

    // تحقق هل الإيميل موجود
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', {
        title: 'Register',
        error: 'هذا الإيميل مُسجَّل مسبقًا',
      });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // حفظ المستخدم في الـ session
    req.session.user = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('register', {
      title: 'Register',
      error: 'حدث خطأ، حاول مرة أخرى',
    });
  }
});

// صفحة تسجيل الدخول (GET)
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// معالجة تسجيل الدخول (POST)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.render('login', {
        title: 'Login',
        error: 'رجاءً أدخل الإيميل وكلمة المرور',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', {
        title: 'Login',
        error: 'مستخدم غير موجود',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', {
        title: 'Login',
        error: 'كلمة المرور غير صحيحة',
      });
    }

    // حفظ المستخدم في الـ session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('login', {
      title: 'Login',
      error: 'حدث خطأ، حاول مرة أخرى',
    });
  }
});

// تسجيل الخروج
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
