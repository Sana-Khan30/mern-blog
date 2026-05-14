import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes    from './routes/authRoutes.js';
import blogRoutes    from './routes/blogRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import userRoutes    from './routes/userRoutes.js';
import uploadRoutes  from './routes/uploadRoutes.js';

dotenv.config();
connectDB();

const app = express();

// ─── SECURITY HEADERS ─────────────────────────────
// Basic headers manually set karo
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ─── MIDDLEWARE ────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : 'http://localhost:5173',
  credentials: true,
}));

// ─── ROUTES ────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/blogs',    blogRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/upload',   uploadRoutes);

// ─── HEALTH CHECK ──────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🚀 MERN Blog API is running!',
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 HANDLER ───────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── GLOBAL ERROR HANDLER ──────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});