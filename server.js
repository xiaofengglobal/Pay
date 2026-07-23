require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jwt-simple');

// Initialize Express
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize Database
const Database = require('./src/database');
const db = new Database();
db.initialize();

// Initialize Email
const EmailService = require('./src/services/email');
const emailService = new EmailService();

// Initialize Telegram
const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

// Initialize Product Service
const ProductService = require('./src/services/products');
const productService = new ProductService();

// Initialize Download Service
const DownloadService = require('./src/services/downloads');
const downloadService = new DownloadService(db);

// Routes
const paymentRoutes = require('./src/routes/payment');
const downloadRoutes = require('./src/routes/download');
const adminRoutes = require('./src/routes/admin');

app.use('/api/payment', paymentRoutes(stripe, db, emailService, telegramBot));
app.use('/api/download', downloadRoutes(downloadService, db));
app.use('/api/admin', adminRoutes(db, emailService));

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

app.get('/download/:token', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'download.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Payment system running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
