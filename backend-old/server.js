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
  origin: '*',
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

// Static files
app.use(express.static(path.join(__dirname, 'public')));

const documentRoutes = require('./src/routes/documents.js');
const tweetRoutes = require('./src/routes/tweets.js');
const userRoutes = require('./src/routes/users.js');
const linkedinRoutes = require('./src/routes/linkedin.js');
const twitterAuthRoutes = require('./src/routes/twitter.js'); // Corrected path

// Initialize Redis Connection
require('./src/config/database.js');

// Initialize scheduled jobs
// const { initScheduledJobs } = require('./src/jobs/scheduleTweets');
const { authenticate } = require('./src/middleware/auth.middleware.js');
// initScheduledJobs();

// Routes
app.use('/api/documents', authenticate, documentRoutes);
app.use('/api/tweets', authenticate, tweetRoutes);
app.use('/api/linkedin', authenticate, linkedinRoutes);
app.use('/api/users', userRoutes);
app.use('/api/twitter', authenticate, twitterAuthRoutes);

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
