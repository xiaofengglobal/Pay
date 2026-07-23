const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

module.exports = (stripe, db, emailService, telegramBot) => {
  const router = express.Router();

  // Get products
  router.get('/products', async (req, res) => {
    try {
      const products = await db.all('SELECT * FROM products');
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create payment intent
  router.post('/create-intent',
    body('productId').notEmpty(),
    body('customerName').notEmpty(),
    body('customerEmail').isEmail(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { productId, customerName, customerEmail } = req.body;
        const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);

        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
          amount: product.price,
          currency: 'usd',
          metadata: {
            productId,
            customerName,
            customerEmail
          }
        });

        res.json({
          clientSecret: paymentIntent.client_secret,
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Webhook for Stripe
  router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { productId, customerName, customerEmail } = paymentIntent.metadata;

        // Create order
        const orderId = uuidv4();
        const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);

        await db.run(
          'INSERT INTO orders (id, product_id, customer_name, customer_email, amount, stripe_payment_intent_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [orderId, productId, customerName, customerEmail, paymentIntent.amount, paymentIntent.id, 'completed']
        );

        // Create download link
        const DownloadService = require('../services/downloads');
        const downloadService = new DownloadService(db);
        const downloadLink = await downloadService.createDownloadLink(orderId);

        // Send emails
        const fullOrder = {
          id: orderId,
          product_id: productId,
          product_name: product.name,
          customer_name: customerName,
          customer_email: customerEmail,
          amount: paymentIntent.amount,
          created_at: new Date().toISOString()
        };

        await emailService.sendOrderConfirmation(fullOrder, downloadLink.url);
        await emailService.sendAdminNotification(fullOrder);

        // Send Telegram notification
        const message = `New Order!\n\nCustomer: ${customerName}\nProduct: ${product.name}\nAmount: $${(paymentIntent.amount / 100).toFixed(2)}\nOrder ID: ${orderId}`;
        
        if (process.env.TELEGRAM_CHAT_ID) {
          await telegramBot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });

  return router;
};
