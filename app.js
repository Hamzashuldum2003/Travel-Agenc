const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// اتصال بقاعدة البيانات
connectDB();

// تشغيل ملفات HTML/CSS/JS داخل public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware لقراءة البيانات من الفورم
app.use(express.urlencoded({ extended: true }));

// إعداد الـ Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// إرسال المستخدم للـ HTML إذا احتجنا لاحقًا
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user;
  next();
});

// الراوترات
const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
