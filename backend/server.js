require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({
  extended: true,
  limit: '50mb'
}));

// File upload limit
app.use((req, res, next) => {
  if (req.method === 'POST' && req.originalUrl === '/api/documents') {
    const fileSize = req.headers['content-length'];
    const maxSize = parseInt(process.env.MAX_FILE_SIZE);
    // if (fileSize > maxSize) {
    //   return res.status(413).json({ error: 'File size exceeds limit' });
    // }
  }
  next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

const documentRoutes = require('./src/routes/documents');
const tweetRoutes = require('./src/routes/tweets');
const linkedinRoutes = require('./src/routes/linkedin');

// Routes
app.use('/api/documents', documentRoutes);
app.use('/api/tweets', tweetRoutes);
app.use('/api/linkedin', linkedinRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
